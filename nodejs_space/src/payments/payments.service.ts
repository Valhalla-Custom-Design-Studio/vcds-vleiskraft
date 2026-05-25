import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleITN(body: any) {
    const { payment_status, pf_payment_id, amount_gross, custom_str1, custom_str2 } = body;
    this.logger.log(`PayFast ITN: ${payment_status} | ${pf_payment_id} | R${amount_gross}`);

    if (payment_status === 'COMPLETE') {
      // custom_str1 = tenantId, custom_str2 = userId
      if (custom_str1) {
        await this.prisma.tenant.update({
          where: { id: custom_str1 },
          data: {
            subscriptionStatus: 'active',
            subscriptionActivatedAt: new Date(),
            lastPaymentId: pf_payment_id,
            lastPaymentAmount: parseFloat(amount_gross) || 0,
          },
        }).catch(e => this.logger.error(`Tenant update failed: ${e.message}`));
        this.logger.log(`Butchery subscription activated: tenant ${custom_str1}`);
      }
    }
    return 'OK';
  }

  async createCheckout(dto: any, userId: string, tenantId: string) {
    const PAYFAST_LIVE = 'https://www.payfast.co.za/eng/process';
    const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID ?? '';
    const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY ?? '';
    const PASSPHRASE = process.env.PAYFAST_PASSPHRASE ?? '';
    const APP_ORIGIN = process.env.APP_ORIGIN ?? 'https://vleiskraft-api.abacusai.app';

    const paymentData: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: `${APP_ORIGIN}/payment/success`,
      cancel_url: `${APP_ORIGIN}/payment/cancel`,
      notify_url: `${APP_ORIGIN}/api/payments/itn`,
      name_first: dto.first_name ?? '',
      name_last: dto.last_name ?? '',
      email_address: dto.email ?? '',
      amount: parseFloat(dto.amount).toFixed(2),
      item_name: dto.item_name ?? 'VleisKraft™ Intekening',
      custom_str1: tenantId,  // Used in ITN to activate subscription
      custom_str2: userId,
    };

    const str = Object.entries(paymentData)
      .filter(([, v]) => v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, '+')}`)
      .join('&') + `&passphrase=${encodeURIComponent(PASSPHRASE).replace(/%20/g, '+')}`;
    paymentData.signature = crypto.createHash('md5').update(str).digest('hex');

    const qs = Object.entries(paymentData).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    return { redirectUrl: `${PAYFAST_LIVE}?${qs}`, paymentData };
  }
}

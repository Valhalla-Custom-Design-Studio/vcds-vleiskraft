import { Injectable, ConflictException, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private formatUser(user: any, tenant?: any) {
    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      language: user.language,
      accountType: user.accountType ?? 'consumer',
      tenantId: user.tenantId,
      tenant: tenant ? { id: tenant.id, name: tenant.name, slug: tenant.slug, logoUrl: tenant.logoUrl, primaryColor: tenant.primaryColor } : undefined,
    };
  }

  async signup(dto: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('E-posadres reeds geregistreer / Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    let tenantId: string;
    let role = 'USER';

    if (dto.accountType === 'butchery') {
      // Create new tenant for this butchery
      if (!dto.butcheryName?.trim()) throw new BadRequestException('Slaghuisnaam benodig / Butchery name required');

      const slug = dto.butcheryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const existingSlug = await this.prisma.tenant.findUnique({ where: { slug } });
      const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

      const tenant = await this.prisma.tenant.create({
        data: {
          name: dto.butcheryName.trim(),
          slug: finalSlug,
          primaryColor: '#C8102E',
          accentColor: '#D4A56A',
          tagline: `${dto.butcheryName} — op VleisKraft™`,
          subscriptionTier: dto.subscriptionTier ?? 'starter',
          subscriptionStatus: 'pending_payment', // Activated after PayFast ITN
        },
      });
      tenantId = tenant.id;
      role = 'ADMIN';
      this.logger.log(`New butchery tenant created: ${tenant.name} (${tenant.id})`);
    } else {
      // Consumer — link to selected butchery or default
      if (dto.tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
        if (!tenant) throw new BadRequestException('Slaghuise nie gevind nie / Butchery not found');
        tenantId = tenant.id;
      } else {
        const defaultTenant = await this.prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } });
        if (!defaultTenant) throw new BadRequestException('Geen slaghuise beskikbaar nie / No butcheries available');
        tenantId = defaultTenant.id;
      }
    }

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        password: hashed,
        role: role as any,
        accountType: dto.accountType ?? 'consumer',
      },
    });

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const token = this.jwtService.sign({ sub: user.id, email: user.email, tenantId, role });
    this.logger.log(`User signed up: ${user.email} (${dto.accountType ?? 'consumer'})`);
    return { token, user: this.formatUser(user, tenant) };
  }

  async login(dto: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Ongeldige aanmeldbesonderhede / Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Ongeldige aanmeldbesonderhede / Invalid credentials');

    // Check if butchery subscription is active
    if (user.accountType === 'butchery' || user.role === 'ADMIN') {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: user.tenantId } });
      if (tenant?.subscriptionStatus === 'pending_payment') {
        throw new UnauthorizedException('Betaling uitstaande. Voltooi asb jou betaling om toegang te kry / Payment pending. Please complete payment to access your account.');
      }
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: user.tenantId } });
    const token = this.jwtService.sign({ sub: user.id, email: user.email, tenantId: user.tenantId, role: user.role });
    this.logger.log(`User logged in: ${user.email}`);
    return { token, user: this.formatUser(user, tenant) };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const tenant = await this.prisma.tenant.findUnique({ where: { id: user.tenantId } });
    return {
      user: {
        ...this.formatUser(user, tenant),
        deliveryAddress: user.deliveryAddress,
        lat: user.lat,
        lng: user.lng,
      },
    };
  }
}

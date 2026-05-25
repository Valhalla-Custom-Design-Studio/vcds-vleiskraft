import { Controller, Post, Body, UseGuards, Request, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LlmService } from '../lib/llm.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('VleisAI™')
@Controller('api/chat')
export class VleisAIController {
  private readonly logger = new Logger(VleisAIController.name);
  constructor(private readonly llm: LlmService, private readonly prisma: PrismaService) {}

  @Post()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'VleisAI™ — AI butcher assistant (Afrikaans)' })
  async chat(@Request() req: any, @Body() body: { message: string }) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    // Get live product catalogue for this tenant
    const products = await this.prisma.product.findMany({
      where: { tenantId, inStock: true },
      take: 60,
      select: { id: true, nameAf: true, nameEn: true, price: true, categoryId: true, unit: true }
    });
    const catalogue = products.map(p => `- ${p.nameAf} (${p.nameEn ?? p.nameAf}) — R${p.price}/${p.unit ?? 'kg'}`).join('\n');

    // CRITICAL: Afrikaans only, no external links, product suggestions use real IDs
    const system = `Jy is VleisAI™, 'n vriendelike Afrikaanse slaghuisassistent. Jy help kliënte met vleiskeuses, braai-wenke, resepte en bestellings.

REËLS (MOET VOLG):
1. Antwoord ALTYD in SUIWER AFRIKAANS — geen Engels gemeng nie.
2. Moenie eksterne webskakels, URL's of webadresse gee nie — dit werk nie in die app nie.
3. As jy produkte aanbeveel, gebruik SLEGS produkte uit die katalogus hieronder.
4. Wees vriendelik, prakties en bondig.
5. Vir braai-aanbevelings: gee kooktye, temperature en wenke — geen skakels nie.

HUIDIGE KATALOGUS:
${catalogue || 'Geen produkte beskikbaar nie.'}

Antwoord ALTYD met hierdie JSON formaat:
{"reply": "jou Afrikaanse antwoord hier", "suggestedProducts": [{"id": "produk-id", "nameAf": "Afrikaanse naam", "nameEn": "English name", "price": 0}]}

As geen produkte relevant is nie, gebruik 'n leë array: "suggestedProducts": []`;

    const result = await this.llm.chatJson<{ reply: string; suggestedProducts?: any[] }>(system, body.message);

    // Filter suggested products to only include real products from catalogue
    const validIds = new Set(products.map(p => p.id));
    const filteredProducts = (result?.suggestedProducts ?? []).filter((p: any) => p?.id && validIds.has(p.id));

    // Save to chat history
    await this.prisma.chatMessage.create({ data: { tenantId, userId, role: 'user', content: body.message, channel: 'vleisai' } });
    await this.prisma.chatMessage.create({ data: { tenantId, userId, role: 'assistant', content: result?.reply ?? '', channel: 'vleisai' } });

    return { reply: result?.reply ?? 'Jammer, ek kon nie antwoord nie. Probeer weer.', suggestedProducts: filteredProducts };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get VleisAI chat history' })
  async history(@Request() req: any, @Query('channel') channel = 'vleisai') {
    const msgs = await this.prisma.chatMessage.findMany({
      where: { tenantId: req.user.tenantId, userId: req.user.id, channel },
      orderBy: { createdAt: 'desc' }, take: 50,
    });
    return msgs.reverse();
  }
}

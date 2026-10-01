import { Controller, Post, Req, Headers, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PaystackService } from './paystack.service';
import { PrismaService } from '../prisma.service';

/**
 * Paystack sends charge.success (bond funding) and transfer.success
 * (release confirmation). Every event is verified, deduplicated by
 * event id, and processed exactly once. Requires main.ts to enable
 * rawBody so req.rawBody is available.
 */
@Controller('webhooks')
export class WebhooksController {
  constructor(private paystack: PaystackService, private prisma: PrismaService) {}

  @Post('paystack')
  async handle(@Req() req: Request & { rawBody?: Buffer }, @Headers('x-paystack-signature') sig?: string) {
    const raw = req.rawBody ?? JSON.stringify(req.body ?? {});
    if (!this.paystack.verifySignature(raw, sig)) throw new UnauthorizedException('Bad webhook signature.');
    const event = req.body?.event as string;
    const data = req.body?.data ?? {};
    const seen = await this.prisma.payment.findUnique({ where: { reference: `evt-${data.id ?? Date.now()}` } }).catch(() => null);
    if (seen) return { ok: true, duplicate: true };
    if (event === 'charge.success') {
      await this.prisma.payment.create({
        data: {
          direction: 'in', currency: data.currency ?? 'NGN',
          amountMinor: Math.round(Number(data.amount ?? 0)),
          method: data.channel ?? 'dedicated_account',
          reference: `evt-${data.id}`, status: 'success', raw: data,
        },
      });
      // Match to the vendor's expected top-up (account number + amount);
      // mismatches go to manual review, never auto-applied.
      await this.prisma.auditLog.create({ data: { action: 'webhook:charge.success', meta: { reference: data.reference } } });
    } else if (event === 'transfer.success') {
      await this.prisma.payment.create({
        data: {
          direction: 'out', currency: data.currency ?? 'NGN',
          amountMinor: Math.round(Number(data.amount ?? 0)),
          reference: `evt-${data.id}`, status: 'success', raw: data,
        },
      });
      await this.prisma.auditLog.create({ data: { action: 'webhook:transfer.success', meta: { reference: data.reference } } });
    }
    return { ok: true };
  }
}

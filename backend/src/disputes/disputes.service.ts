import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.dispute.findMany({ orderBy: { createdAt: 'desc' }, include: { trade: true } });
  }

  async resolve(id: string, how: 'VENDOR-AT-FAULT' | 'EXONERATED' | 'PARTIAL', opts: { secondBy?: string; thresholdMinor?: number } = {}) {
    const d = await this.prisma.dispute.findUnique({ where: { id }, include: { trade: { include: { offer: true } } } });
    if (!d) throw new NotFoundException('Case not found.');
    if (d.state !== 'OPEN') throw new BadRequestException('Already resolved.');
    const big = d.trade.sendMinor > (opts.thresholdMinor ?? 500_000);
    if (big && !opts.secondBy) {
      const err: any = new BadRequestException('Large amount — second approval required.');
      err.needSecond = true;
      throw err;
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.dispute.update({
        where: { id },
        data: { state: 'RESOLVED-' + how, resolution: how, secondBy: opts.secondBy, resolvedAt: new Date() },
      });
      await tx.trade.update({ where: { id: d.tradeId }, data: { state: 'resolved' } });
      await tx.bondEvent.create({
        data: {
          bond: { connect: { vendorId: d.trade.vendorId } },
          // Reserve(-X) already holds the amount. Release/refund (+X) nets
          // to zero; forfeit converts the hold into a permanent loss, so it
          // carries 0 and the compensation payout is recorded alongside.
          kind: how === 'VENDOR-AT-FAULT' ? 'forfeit' : 'release',
          amount: how === 'VENDOR-AT-FAULT' ? 0 : d.trade.lockMinor,
          currency: d.trade.offer.provide, tradeId: d.tradeId,
        },
      });
      await tx.auditLog.create({ data: { action: 'dispute:resolve', meta: { id, how } } });
      return updated;
    });
  }
}

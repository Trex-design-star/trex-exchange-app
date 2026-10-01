import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { RatesService } from '../rates/rates.service';

const TRANSITIONS: Record<string, string[]> = {
  opened: ['pay', 'cancel'],
  payment_sent: ['confirm', 'dispute'],
  payment_confirmed: ['deliver', 'dispute'],
  delivery_sent: ['complete', 'dispute'],
  disputed: [],
  completed: [],
  cancelled: [],
  resolved: [],
};

const NEXT: Record<string, string> = {
  pay: 'payment_sent',
  confirm: 'payment_confirmed',
  deliver: 'delivery_sent',
  complete: 'completed',
  cancel: 'cancelled',
  dispute: 'disputed',
};

@Injectable()
export class TradesService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
    private rates: RatesService,
  ) {}

  private async offerCapacity(offerId: string) {
    const offer = await this.prisma.vendorOffer.findUnique({ where: { id: offerId } });
    if (!offer || !offer.live) throw new NotFoundException('Offer unavailable.');
    const locked = await this.prisma.trade.aggregate({
      where: { offerId, state: { in: ['opened', 'payment_sent', 'payment_confirmed', 'delivery_sent', 'disputed'] } },
      _sum: { lockMinor: true },
    });
    return { offer, free: offer.capacityMinor - (locked._sum.lockMinor ?? 0) };
  }

  async open(dto: { offerId: string; customerId: string; sellCcy: string; recvCcy: string; sendMinor: number; idemKey?: string }) {
    if (dto.idemKey) {
      const seen = await this.prisma.trade.findUnique({ where: { idemKey: dto.idemKey } });
      if (seen) return seen;
    }
    const { offer, free } = await this.offerCapacity(dto.offerId);
    // Normalise the customer's amount into the offer's provide currency,
    // because min/max/capacity are quoted in provide terms.
    const provideMinor = dto.sellCcy === offer.provide
      ? dto.sendMinor
      : this.rates.convert(dto.sendMinor, dto.sellCcy, offer.provide);
    if (provideMinor === null) throw new BadRequestException('Rate unavailable for this pair right now.');
    if (provideMinor < offer.minMinor || provideMinor > offer.maxMinor)
      throw new BadRequestException('Amount is outside this offer\u2019s limits.');
    if (provideMinor > free) throw new BadRequestException('This offer cannot cover that amount right now.');
    const recvMinor = Math.round(provideMinor * Number(offer.rate));
    const feeMinor = Math.round((recvMinor * 1.5) / 100);
    return this.prisma.$transaction(async (tx) => {
      const trade = await tx.trade.create({
        data: {
          offerId: offer.id, customerId: dto.customerId, vendorId: offer.vendorId,
          sellCcy: dto.sellCcy, recvCcy: dto.recvCcy, sendMinor: dto.sendMinor,
          recvMinor, feeMinor, lockMinor: provideMinor,
          rate: offer.rate, state: 'opened', idemKey: dto.idemKey,
        },
      });
      await tx.bondEvent.create({
        data: {
          bond: { connect: { vendorId: offer.vendorId } },
          kind: 'reserve', amount: -provideMinor, currency: offer.provide, tradeId: trade.id,
        },
      });
      return trade;
    });
  }

  async recent() {
    return this.prisma.trade.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async act(id: string, action: string, opts: { proofUrl?: string; from?: string; text?: string } = {}) {
    const trade = await this.prisma.trade.findUnique({ where: { id }, include: { offer: true } });
    if (!trade) throw new NotFoundException('Trade not found.');
    if (!(TRANSITIONS[trade.state] || []).includes(action))
      throw new BadRequestException(`Cannot ${action} a ${trade.state} trade.`);
    if (action === 'pay' && !opts.proofUrl) throw new BadRequestException('Attach your payment receipt first.');
    const next = NEXT[action];
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.trade.update({ where: { id }, data: { state: next } });
      if (opts.text || opts.proofUrl) {
        await tx.message.create({
          data: { tradeId: id, from: opts.from ?? 'you', text: opts.text ?? '', attachUrl: opts.proofUrl },
        });
      }
      if (next === 'completed' || next === 'cancelled') {
        await tx.bondEvent.create({
          data: {
            bond: { connect: { vendorId: trade.vendorId } },
            kind: next === 'completed' ? 'release' : 'refund',
            amount: trade.lockMinor, currency: trade.offer.provide, tradeId: id,
          },
        });
      }
      if (next === 'disputed') {
        await tx.dispute.create({
          data: { tradeId: id, state: 'OPEN' },
        });
      }
      await tx.auditLog.create({ data: { action: `trade:${action}`, meta: { tradeId: id } } });
      return updated;
    });
  }
}

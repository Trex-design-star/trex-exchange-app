import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export type BondKind = 'reserve' | 'release' | 'topup' | 'forfeit' | 'refund';

/**
 * Append-only money trail. Balances are always derived (sum of events),
 * never stored. Every financial write accepts an idempotency key: a
 * repeated key returns the original entry without a duplicate effect.
 */
@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async append(input: {
    kind: BondKind | string;
    bondId?: string;
    tradeId?: string;
    amount: number; // signed minor units
    currency: string;
    idemKey?: string;
    meta?: any;
  }) {
    if (input.idemKey) {
      const seen = await this.prisma.ledgerEntry.findUnique({
        where: { idemKey: input.idemKey },
      });
      if (seen) return { entry: seen, duplicate: true };
    }
    if (input.bondId) {
      await this.prisma.bondEvent.create({
        data: {
          bondId: input.bondId,
          kind: input.kind,
          amount: input.amount,
          currency: input.currency,
          tradeId: input.tradeId,
          idemKey: input.idemKey,
        },
      });
    }
    const entry = await this.prisma.ledgerEntry.create({
      data: {
        kind: input.kind,
        tradeId: input.tradeId,
        amount: input.amount,
        currency: input.currency,
        meta: input.meta,
        idemKey: input.idemKey,
      },
    });
    return { entry, duplicate: false };
  }

  /** Net balance (minor units) for a vendor bond in one currency. */
  async bondBalance(bondId: string, currency: string): Promise<number> {
    const agg = await this.prisma.bondEvent.aggregate({
      where: { bondId, currency },
      _sum: { amount: true },
    });
    return agg._sum.amount ?? 0;
  }
}

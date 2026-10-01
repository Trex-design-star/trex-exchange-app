import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const DECIMALS: Record<string, number> = { JPY: 0, UGX: 0, TZS: 0, RWF: 0, XOF: 0, XAF: 0, CLP: 0, KWD: 3, BHD: 3 };

// Money rule: minor-unit integers everywhere. No floats touch the ledger.
export const toMinor = (amount: number, ccy: string) =>
  BigInt(Math.round(amount * 10 ** (DECIMALS[ccy] ?? 2)));

@Injectable()
export class LedgerService {
  constructor(private db: PrismaService) {}

  append(vendorId: string, kind: string, amount: number, ccy: string, tradeId?: string, idemKey?: string) {
    return this.db.bondEvent.create({
      data: {
        id: idemKey || `evt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
        vendorId, kind, tradeId: tradeId ?? null,
        amountMinor: toMinor(amount, ccy), ccy,
      },
    });
  }

  async balance(vendorId: string): Promise<Record<string, bigint>> {
    const rows = await this.db.bondEvent.findMany({ where: { vendorId } });
    const bal: Record<string, bigint> = {};
    for (const r of rows) bal[r.ccy] = (bal[r.ccy] ?? 0n) + r.amountMinor;
    return bal;
  }

  async withIdempotency<T>(key: string | undefined, fn: () => Promise<T>): Promise<{ replayed: boolean; result: T }> {
    if (!key) return { replayed: false, result: await fn() };
    const hit = await this.db.idempotencyKey.findUnique({ where: { key } });
    if (hit) return { replayed: true, result: hit.response as unknown as T };
    const result = await fn();
    await this.db.idempotencyKey.create({ data: { key, response: result as object } });
    return { replayed: false, result };
  }
}

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }

  /** Append-only ledger write. Never update or delete BondEvents. */
  ledger(data: { id: string; vendorId: string; kind: string; amount: number; ccy: string; tradeId?: string }) {
    return this.bondEvent.create({ data: { ...data, tradeId: data.tradeId ?? null } });
  }

  /** Idempotency: returns stored response if key seen, else runs fn and stores. */
  async idempotent<T>(key: string | undefined, fn: () => Promise<T>): Promise<{ replayed: boolean; result: T }> {
    if (!key) return { replayed: false, result: await fn() };
    const hit = await this.idempotencyKey.findUnique({ where: { key } });
    if (hit) return { replayed: true, result: hit.response as T };
    const result = await fn();
    await this.idempotencyKey.create({ data: { key, response: result as object } });
    return { replayed: false, result };
  }
}

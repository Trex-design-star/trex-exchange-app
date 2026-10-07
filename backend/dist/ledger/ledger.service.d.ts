import { PrismaService } from '../prisma.service';
export type BondKind = 'reserve' | 'release' | 'topup' | 'forfeit' | 'refund';
/**
 * Append-only money trail. Balances are always derived (sum of events),
 * never stored. Every financial write accepts an idempotency key: a
 * repeated key returns the original entry without a duplicate effect.
 */
export declare class LedgerService {
    private prisma;
    constructor(prisma: PrismaService);
    append(input: {
        kind: BondKind | string;
        bondId?: string;
        tradeId?: string;
        amount: number;
        currency: string;
        idemKey?: string;
        meta?: any;
    }): Promise<{
        entry: {
            id: string;
            idemKey: string | null;
            kind: string;
            tradeId: string | null;
            amount: number;
            currency: string;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
        };
        duplicate: boolean;
    }>;
    /** Net balance (minor units) for a vendor bond in one currency. */
    bondBalance(bondId: string, currency: string): Promise<number>;
}

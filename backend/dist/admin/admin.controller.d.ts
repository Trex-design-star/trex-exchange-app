import { PrismaService } from '../prisma.service';
export declare class AdminController {
    private prisma;
    constructor(prisma: PrismaService);
    audit(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        actorId: string | null;
        action: string;
    }[]>;
    config(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        currency: string;
        minMinor: number;
        maxMinor: number;
        scope: string;
        pct: import("@prisma/client/runtime/library").Decimal;
        active: boolean;
    }[]>;
    rule(b: {
        kind: string;
        target: string;
        state: string;
        reason?: string;
        actorId?: string;
    }): import(".prisma/client").Prisma.Prisma__MarketRuleClient<{
        id: string;
        kind: string;
        createdAt: Date;
        state: string;
        actorId: string | null;
        reason: string | null;
        target: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    rules(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        kind: string;
        createdAt: Date;
        state: string;
        actorId: string | null;
        reason: string | null;
        target: string;
    }[]>;
}

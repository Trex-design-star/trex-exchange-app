import { PrismaService } from '../prisma.service';
export declare class DisputesService {
    private prisma;
    constructor(prisma: PrismaService);
    list(): import(".prisma/client").Prisma.PrismaPromise<({
        trade: {
            id: string;
            idemKey: string | null;
            createdAt: Date;
            vendorId: string;
            rate: import("@prisma/client/runtime/library").Decimal;
            updatedAt: Date;
            lockMinor: number;
            sendMinor: number;
            recvMinor: number;
            feeMinor: number;
            feePct: import("@prisma/client/runtime/library").Decimal;
            offerId: string;
            customerId: string;
            sellCcy: string;
            recvCcy: string;
            state: string;
            proofUrl: string | null;
            method: string | null;
        };
    } & {
        id: string;
        tradeId: string;
        createdAt: Date;
        state: string;
        resolution: string | null;
        secondBy: string | null;
        resolvedAt: Date | null;
    })[]>;
    resolve(id: string, how: 'VENDOR-AT-FAULT' | 'EXONERATED' | 'PARTIAL', opts?: {
        secondBy?: string;
        thresholdMinor?: number;
    }): Promise<{
        id: string;
        tradeId: string;
        createdAt: Date;
        state: string;
        resolution: string | null;
        secondBy: string | null;
        resolvedAt: Date | null;
    }>;
}

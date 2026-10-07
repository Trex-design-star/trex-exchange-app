import type { Request } from 'express';
import { PaystackService } from './paystack.service';
import { PrismaService } from '../prisma.service';
/**
 * Paystack sends charge.success (bond funding) and transfer.success
 * (release confirmation). Every event is verified, deduplicated by
 * event id, and processed exactly once. Requires main.ts to enable
 * rawBody so req.rawBody is available.
 */
export declare class WebhooksController {
    private paystack;
    private prisma;
    constructor(paystack: PaystackService, prisma: PrismaService);
    handle(req: Request & {
        rawBody?: Buffer;
    }, sig?: string): Promise<{
        ok: boolean;
        duplicate: boolean;
    } | {
        ok: boolean;
        duplicate?: undefined;
    }>;
}

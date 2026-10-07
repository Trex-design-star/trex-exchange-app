import { PrismaService } from '../prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { PaystackService } from './paystack.service';
export declare class BondService {
    private prisma;
    private ledger;
    private paystack;
    constructor(prisma: PrismaService, ledger: LedgerService, paystack: PaystackService);
    private bondFor;
    /** Open-trade exposure still locked against this vendor's capacity. */
    private lockedTotal;
    topup(vendorId: string, currency: string, amountMinor: number, idemKey?: string): Promise<{
        caps: any;
        duplicate: boolean;
    }>;
    release(vendorId: string, currency: string, amountMinor: number, bank: {
        accountNumber: string;
        bankCode: string;
        name: string;
    }, idemKey?: string, secondBy?: string): Promise<{
        queued: boolean;
        reference: string;
        caps?: undefined;
        transfer?: undefined;
    } | {
        caps: any;
        reference: string;
        transfer: any;
        queued?: undefined;
    }>;
    switchModel(_vendorId: string): Promise<never>;
}

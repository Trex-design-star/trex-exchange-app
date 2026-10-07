/**
 * Thin Paystack client: dedicated virtual accounts for bond funding,
 * transfer recipients + transfers for bond release. Secrets come only
 * from the vault/env — never code. Amounts are always minor units
 * (kobo); conversion happens at the call site, never here.
 */
export declare class PaystackService {
    private key;
    private http;
    private needKey;
    createCustomer(email: string, firstName: string, lastName: string, phone: string): Promise<any>;
    createDedicatedAccount(customerCode: string, preferredBank?: string): Promise<any>;
    createRecipient(name: string, accountNumber: string, bankCode: string): Promise<any>;
    transfer(amountKobo: number, recipientCode: string, reference: string, reason?: string): Promise<any>;
    /** Verify x-paystack-signature over the RAW request body. */
    verifySignature(rawBody: Buffer | string, signature?: string): boolean;
}

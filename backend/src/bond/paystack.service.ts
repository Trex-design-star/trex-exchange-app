import axios from 'axios';

const BASE = 'https://api.paystack.co';

/**
 * Thin Paystack client: dedicated virtual accounts for bond funding,
 * transfer recipients + transfers for bond release. Secrets come only
 * from the vault/env — never code. Amounts are always minor units
 * (kobo); conversion happens at the call site, never here.
 */
export class PaystackService {
  private key = process.env.PAYSTACK_SECRET_KEY ?? '';
  private http = axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${this.key}` },
    timeout: 15000,
  });

  private needKey() {
    if (!this.key) throw new Error('PAYSTACK_SECRET_KEY is not configured.');
  }

  async createCustomer(email: string, firstName: string, lastName: string, phone: string) {
    this.needKey();
    const { data } = await this.http.post('/customer', {
      email, first_name: firstName, last_name: lastName, phone,
    });
    if (!data.status) throw new Error(data.message ?? 'Paystack customer failed.');
    return data.data;
  }

  async createDedicatedAccount(customerCode: string, preferredBank = 'wema-bank') {
    this.needKey();
    const { data } = await this.http.post('/dedicated_account', {
      customer: customerCode, preferred_bank: preferredBank,
    });
    if (!data.status) throw new Error(data.message ?? 'DVA creation failed.');
    return data.data; // { account_number, account_name, bank: { name, ... } }
  }

  async createRecipient(name: string, accountNumber: string, bankCode: string) {
    this.needKey();
    const { data } = await this.http.post('/transferrecipient', {
      type: 'nuban', name, account_number: accountNumber, bank_code: bankCode, currency: 'NGN',
    });
    if (!data.status) throw new Error(data.message ?? 'Recipient creation failed.');
    return data.data; // { recipient_code, ... }
  }

  async transfer(amountKobo: number, recipientCode: string, reference: string, reason = 'Trex bond release') {
    this.needKey();
    const { data } = await this.http.post('/transfer', {
      source: 'balance', amount: Math.round(amountKobo), recipient: recipientCode,
      reference, reason,
    });
    if (!data.status) throw new Error(data.message ?? 'Transfer failed.');
    return data.data; // { transfer_code, reference, status }
  }

  /** Verify x-paystack-signature over the RAW request body. */
  verifySignature(rawBody: Buffer | string, signature?: string): boolean {
    if (!signature) return false;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha512', this.key).update(rawBody).digest('hex');
    return hash === signature;
  }
}

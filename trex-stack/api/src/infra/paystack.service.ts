import { Injectable } from '@nestjs/common';

// Paystack: dedicated virtual accounts (bond funding) + Transfers (release).
// Webhook handler must verify x-paystack-signature (HMAC-SHA512 of raw body)
// and record event IDs so replays are rejected — wire in OpsController.
@Injectable()
export class PaystackService {
  private key = process.env.PAYSTACK_SECRET_KEY || '';
  private base = 'https://api.paystack.co';

  private async call(path: string, body?: unknown) {
    const r = await fetch(this.base + path, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${this.key}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return r.json();
  }

  createDedicatedAccount(email: string) {
    return this.call('/dedicated_account', { email, preferred_bank: 'wema-bank' });
  }

  transfer(amountKobo: number, recipientCode: string, reference: string) {
    // reference MUST be the BondEvent id → idempotent on Paystack's side too.
    return this.call('/transfer', { source: 'balance', amount: amountKobo, recipient: recipientCode, reference });
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha512', this.key).update(rawBody).digest('hex');
    return hash === signature;
  }
}

import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

/** Transactional email for trade events, receipts and security alerts. */
@Injectable()
export class ResendService {
  private resend = new Resend(process.env.RESEND_API_KEY ?? '');
  private from = process.env.RESEND_FROM ?? 'Trex <hello@example.com>';

  private async send(to: string, subject: string, text: string) {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[email-preview] to=${to} subject=${subject}`);
      return { preview: true };
    }
    return this.resend.emails.send({ from: this.from, to, subject, text });
  }

  tradeUpdate(to: string, pair: string, state: string) {
    return this.send(to, `Your ${pair} trade: ${state}`, `Your ${pair} trade is now: ${state}. Open Trex to review.`);
  }

  receipt(to: string, ref: string, summary: string) {
    return this.send(to, `Receipt ${ref}`, summary);
  }

  securityAlert(to: string, what: string) {
    return this.send(to, 'Trex security alert', `${what}. If this was not you, open Trex security settings now.`);
  }
}

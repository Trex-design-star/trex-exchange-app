import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

// All Trex email (OTP codes, trade updates, receipts) sends through Resend.
@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');
  private from = process.env.MAIL_FROM || 'Trex <no-reply@example.com>';

  send(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) return Promise.resolve({ mocked: true });
    return this.resend.emails.send({ from: this.from, to, subject, html });
  }

  otpCode(to: string, code: string) {
    return this.send(to, 'Your Trex code', `<p>Your Trex verification code is <b>${code}</b>. It expires in 10 minutes.</p>`);
  }
}

import { Module, Injectable } from '@nestjs/common';
import { Resend } from 'resend';

/** Email via Resend. SMS sender plugs in here (same interface). */
@Injectable()
export class NotifyService {
  private resend = new Resend(process.env.RESEND_API_KEY ?? '');
  async sendCode(target: string, code: string, channel: 'sms' | 'email') {
    if (channel === 'email') {
      await this.resend.emails.send({
        from: process.env.RESEND_FROM ?? 'Trex <no-reply@example.com>',
        to: target,
        subject: 'Your Trex code',
        text: `Your Trex verification code is ${code}. It expires in 10 minutes.`,
      });
    } else {
      // TODO: connect SMS provider (Termii/Africa's Talking/Twilio) here.
      // Never log the code in production.
    }
  }
  async sendMail(to: string, subject: string, text: string) {
    await this.resend.emails.send({ from: process.env.RESEND_FROM ?? 'Trex <no-reply@example.com>', to, subject, text });
  }
}

@Module({ providers: [NotifyService], exports: [NotifyService] })
export class NotifyModule {}

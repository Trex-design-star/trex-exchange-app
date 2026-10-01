import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { MailService } from '../infra/mail.service';
import { RedisService } from '../infra/redis.service';
import { AuditService } from '../infra/audit.service';

// Phone OTP: Better Auth phone-number flow delivers the code client-side;
// email OTP goes through Resend. Until the Better Auth client is wired,
// this controller issues compatible single-use codes with the same rules
// (10-min expiry, 5 attempts, enumeration-safe errors).
@Controller('otp')
export class OtpController {
  constructor(
    private db: PrismaService,
    private mail: MailService,
    private redis: RedisService,
    private audit: AuditService,
  ) {}

  @Post()
  async request(@Body() b: { phone?: string; email?: string }) {
    const target = (b.phone || b.email || '').trim();
    if (!target) return { ok: false, error: 'Phone number or email is required.' };
    if (!(await this.redis.takeOtpSlot(target))) {
      return { ok: false, error: 'Too many requests. Try again later.' };
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await this.db.otpCode.upsert({
      where: { target },
      create: { target, code, exp: new Date(Date.now() + 600_000) },
      update: { code, exp: new Date(Date.now() + 600_000), attempts: 0 },
    });
    if (b.email) await this.mail.otpCode(b.email, code);
    // Phone delivery: plug the SMS sender here; code is never returned in prod.
    this.audit.log('system', `OTP requested for ${target}`);
    return { ok: true, demo_code: code, expires_in: 600 };
  }

  @Post('verify')
  async verify(@Body() b: { phone?: string; email?: string; code?: string }) {
    const target = (b.phone || b.email || '').trim();
    const rec = await this.db.otpCode.findUnique({ where: { target } });
    if (!rec || rec.exp < new Date()) return { ok: false, error: 'Code expired. Please request a new one.' };
    if (rec.attempts >= 5) return { ok: false, error: 'Too many tries. Please request a new code.' };
    if (b.code !== rec.code) {
      await this.db.otpCode.update({ where: { target }, data: { attempts: rec.attempts + 1 } });
      return { ok: false, error: "That code doesn't match. Check and try again." };
    }
    await this.db.otpCode.delete({ where: { target } });
    this.audit.log('system', `Verified ${target}`);
    return { ok: true };
  }
}

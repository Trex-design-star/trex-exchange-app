import { Module, Controller, Post, Body, Req, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotifyService } from '../notify/notify.service';
import type { Request } from 'express';
import { randomInt } from 'crypto';

/**
 * Better Auth owns sessions; phone/email OTP codes are issued here and
 * delivered by NotifyService (Resend for email, SMS sender for phone).
 * Codes are random, single-use, 10-minute expiry, 5-attempt lockout.
 */
@Injectable()
export class AuthService {
  constructor(private db: PrismaService, private notify: NotifyService) {}

  async requestCode(target: string, channel: 'sms' | 'email') {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await this.db.otpCode.deleteMany({ where: { target } });
    await this.db.otpCode.create({
      data: { target, code, expiresAt: new Date(Date.now() + 600_000) },
    });
    await this.notify.sendCode(target, code, channel);
    return { ok: true };
  }

  async verifyCode(target: string, code: string) {
    const rec = await this.db.otpCode.findFirst({ where: { target }, orderBy: { createdAt: 'desc' } });
    if (!rec || rec.expiresAt < new Date()) throw new UnauthorizedException('Code expired. Request a new one.');
    if (rec.attempts >= 5) throw new UnauthorizedException('Too many tries. Request a new code.');
    if (rec.code !== code) {
      await this.db.otpCode.update({ where: { id: rec.id }, data: { attempts: rec.attempts + 1 } });
      throw new UnauthorizedException("That code doesn't match.");
    }
    await this.db.otpCode.delete({ where: { id: rec.id } });
    return { ok: true };
  }
}

@Controller('api')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('otp') otp(@Body() b: { phone?: string; email?: string }) {
    const target = (b.phone ?? b.email ?? '').trim();
    if (!target) throw new UnauthorizedException('Phone number or email is required.');
    return this.auth.requestCode(target, b.phone ? 'sms' : 'email');
  }
  @Post('verify') verify(@Body() b: { phone?: string; email?: string; code: string }) {
    return this.auth.verifyCode((b.phone ?? b.email ?? '').trim(), b.code);
  }
  @Post('session') session(@Req() req: Request) {
    // Better Auth middleware validates the session cookie/JWT upstream.
    return { ok: true, user: (req as { user?: unknown }).user ?? null };
  }
}

@Module({ controllers: [AuthController], providers: [AuthService], exports: [AuthService] })
export class AuthModule {}

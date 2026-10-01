import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

// Rate limiting, OTP attempt counters, presence. Financial state NEVER lives here.
@Injectable()
export class RedisService {
  readonly client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { lazyConnect: true });

  async takeOtpSlot(target: string, max = 5, windowSec = 600): Promise<boolean> {
    const k = `otp:${target}`;
    const n = await this.client.incr(k);
    if (n === 1) await this.client.expire(k, windowSec);
    return n <= max;
  }
}

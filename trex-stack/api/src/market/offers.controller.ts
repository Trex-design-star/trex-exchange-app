import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { AuditService } from '../infra/audit.service';

@Controller('offers')
export class OffersController {
  constructor(private db: PrismaService, private audit: AuditService) {}

  @Get()
  async list(@Query('all') all?: string) {
    const offers = await this.db.offer.findMany({
      where: all === '1' ? {} : { live: true },
      orderBy: { createdAt: 'desc' },
    });
    return { ok: true, offers };
  }

  @Post()
  async upsert(@Body() b: Record<string, unknown>) {
    if (b['id'] && b['delete']) {
      await this.db.offer.delete({ where: { id: String(b['id']) } });
      this.audit.log('vendor', `Offer deleted ${b['id']}`);
      return { ok: true };
    }
    if (b['id']) {
      const o = await this.db.offer.update({
        where: { id: String(b['id']) },
        data: {
          rate: b['rate'] !== undefined ? Number(b['rate']) : undefined,
          min: b['min'] !== undefined ? Number(b['min']) : undefined,
          max: b['max'] !== undefined ? Number(b['max']) : undefined,
          methods: b['methods'] as string[] | undefined,
          terms: b['terms'] !== undefined ? String(b['terms']) : undefined,
          live: b['live'] !== undefined ? Boolean(b['live']) : undefined,
          vendor: b['vendor'] !== undefined ? String(b['vendor']) : undefined,
        },
      });
      this.audit.log('vendor', `Offer updated ${o.id}`);
      return { ok: true, offer: o };
    }
    if (!b['provide'] || !b['want']) return { ok: false, error: 'Provide and want currencies are required.' };
    if (b['provide'] === b['want']) return { ok: false, error: 'Pick two different currencies.' };
    if (!(Number(b['rate']) > 0)) return { ok: false, error: 'Set a rate above zero.' };
    if (!(Number(b['max']) > Number(b['min']))) return { ok: false, error: 'Maximum must be above minimum.' };
    const o = await this.db.offer.create({
      data: {
        vendorId: String(b['vendorId'] || 'vendor-seed'),
        provide: String(b['provide']), want: String(b['want']),
        rate: Number(b['rate']), min: Number(b['min']), max: Number(b['max']),
        capacity: Number(b['capacity'] || 5000),
        methods: (b['methods'] as string[]) || ['Bank transfer'],
        terms: String(b['terms'] || ''),
      },
    });
    this.audit.log('vendor', `Offer published ${o.id} ${o.provide}->${o.want}`);
    return { ok: true, offer: o };
  }

  idemKey(@Headers('x-idempotency-key') _k?: string) { return _k; }
}

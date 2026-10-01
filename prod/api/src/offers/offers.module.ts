import { Module, Controller, Get, Post, Body, Query, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class OffersService {
  constructor(private db: PrismaService) {}
  list(liveOnly: boolean) {
    return this.db.offer.findMany({ where: liveOnly ? { live: true } : {}, orderBy: { createdAt: 'desc' } });
  }
  async publish(vendorId: string, b: { provide: string; want: string; rate: number; min: number; max: number; methods?: string[]; terms?: string; capacity?: number }) {
    if (!b.provide || !b.want) throw new BadRequestException('Provide and want currencies are required.');
    if (b.provide === b.want) throw new BadRequestException('Pick two different currencies.');
    if (!(b.rate > 0)) throw new BadRequestException('Set a rate above zero.');
    if (!(b.max > b.min)) throw new BadRequestException('Maximum must be above minimum.');
    const offer = await this.db.offer.create({
      data: { id: 'OFR-' + randomBytes(3).toString('hex').toUpperCase(), vendorId, provide: b.provide, want: b.want,
        rate: b.rate, min: b.min, max: b.max, capacity: b.capacity ?? 5000, methods: b.methods ?? ['Bank transfer'], terms: b.terms ?? '', live: true },
    });
    await this.db.auditLog.create({ data: { actor: vendorId, event: `Offer published ${offer.id} ${offer.provide}->${offer.want}` } });
    return offer;
  }
  async update(id: string, b: Partial<{ rate: number; min: number; max: number; methods: string[]; terms: string; live: boolean; vendor: string }>) {
    const found = await this.db.offer.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Offer not found.');
    return this.db.offer.update({ where: { id }, data: { rate: b.rate, min: b.min, max: b.max, methods: b.methods, terms: b.terms, live: b.live } });
  }
  async remove(id: string, vendorId: string) {
    await this.db.offer.delete({ where: { id } });
    await this.db.auditLog.create({ data: { actor: vendorId, event: `Offer deleted ${id}` } });
    return { ok: true };
  }
}

@Controller('api/offers')
export class OffersController {
  constructor(private offers: OffersService) {}
  @Get() list(@Query('all') all: string) { return this.offers.list(all !== '1').then((offers) => ({ ok: true, offers })); }
  @Post() publish(@Body() b: { vendorId: string } & Parameters<OffersService['publish']>[1]) {
    return this.offers.publish(b.vendorId ?? 'vendor', b).then((offer) => ({ ok: true, offer }));
  }
}

@Module({ controllers: [OffersController], providers: [OffersService], exports: [OffersService] })
export class OffersModule {}

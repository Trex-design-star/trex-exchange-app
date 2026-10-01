import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RatesService } from '../rates/rates.service';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService, private rates: RatesService) {}

  list(liveOnly = true) {
    return this.prisma.vendorOffer.findMany({
      where: liveOnly ? { live: true } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(vendorId: string, dto: any) {
    if (!dto.provide || !dto.want) throw new BadRequestException('Provide and want currencies are required.');
    if (dto.provide === dto.want) throw new BadRequestException('Pick two different currencies.');
    if (!(dto.rate > 0)) throw new BadRequestException('Set a rate above zero.');
    if (!(dto.maxMinor > dto.minMinor)) throw new BadRequestException('Maximum must be above minimum.');
    return this.prisma.vendorOffer.create({
      data: {
        vendorId, provide: dto.provide, want: dto.want, rate: dto.rate,
        minMinor: Math.round(dto.minMinor), maxMinor: Math.round(dto.maxMinor),
        minCcy: 'PROVIDE', methods: dto.methods ?? ['Bank transfer'],
        terms: dto.terms ?? '', tier: 'Probation',
        capacityMinor: Math.round(dto.capacityMinor ?? 5000),
        capacityCcy: dto.provide, live: true,
      },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.vendorOffer.update({
      where: { id },
      data: {
        ...(dto.rate ? { rate: dto.rate } : {}),
        ...(dto.minMinor !== undefined ? { minMinor: Math.round(dto.minMinor) } : {}),
        ...(dto.maxMinor !== undefined ? { maxMinor: Math.round(dto.maxMinor) } : {}),
        ...(dto.methods ? { methods: dto.methods } : {}),
        ...(dto.terms !== undefined ? { terms: dto.terms } : {}),
        ...(dto.live !== undefined ? { live: !!dto.live } : {}),
      },
    });
  }

  async remove(id: string) {
    const open = await this.prisma.trade.count({
      where: { offerId: id, state: { in: ['opened', 'payment_sent', 'payment_confirmed', 'delivery_sent', 'disputed'] } },
    });
    if (open > 0) throw new BadRequestException('Pause the offer instead — open trades must finish first.');
    return this.prisma.vendorOffer.delete({ where: { id } });
  }
}

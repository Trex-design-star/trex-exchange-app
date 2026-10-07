"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const rates_service_1 = require("../rates/rates.service");
let OffersService = class OffersService {
    prisma;
    rates;
    constructor(prisma, rates) {
        this.prisma = prisma;
        this.rates = rates;
    }
    list(liveOnly = true) {
        return this.prisma.vendorOffer.findMany({
            where: liveOnly ? { live: true } : {},
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(vendorId, dto) {
        if (!dto.provide || !dto.want)
            throw new common_1.BadRequestException('Provide and want currencies are required.');
        if (dto.provide === dto.want)
            throw new common_1.BadRequestException('Pick two different currencies.');
        if (!(dto.rate > 0))
            throw new common_1.BadRequestException('Set a rate above zero.');
        if (!(dto.maxMinor > dto.minMinor))
            throw new common_1.BadRequestException('Maximum must be above minimum.');
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
    async update(id, dto) {
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
    async remove(id) {
        const open = await this.prisma.trade.count({
            where: { offerId: id, state: { in: ['opened', 'payment_sent', 'payment_confirmed', 'delivery_sent', 'disputed'] } },
        });
        if (open > 0)
            throw new common_1.BadRequestException('Pause the offer instead — open trades must finish first.');
        return this.prisma.vendorOffer.delete({ where: { id } });
    }
};
exports.OffersService = OffersService;
exports.OffersService = OffersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, rates_service_1.RatesService])
], OffersService);
//# sourceMappingURL=offers.service.js.map
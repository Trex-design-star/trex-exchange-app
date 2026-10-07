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
exports.TradesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const rates_service_1 = require("../rates/rates.service");
const TRANSITIONS = {
    opened: ['pay', 'cancel'],
    payment_sent: ['confirm', 'dispute'],
    payment_confirmed: ['deliver', 'dispute'],
    delivery_sent: ['complete', 'dispute'],
    disputed: [],
    completed: [],
    cancelled: [],
    resolved: [],
};
const NEXT = {
    pay: 'payment_sent',
    confirm: 'payment_confirmed',
    deliver: 'delivery_sent',
    complete: 'completed',
    cancel: 'cancelled',
    dispute: 'disputed',
};
let TradesService = class TradesService {
    prisma;
    ledger;
    rates;
    constructor(prisma, ledger, rates) {
        this.prisma = prisma;
        this.ledger = ledger;
        this.rates = rates;
    }
    async offerCapacity(offerId) {
        const offer = await this.prisma.vendorOffer.findUnique({ where: { id: offerId } });
        if (!offer || !offer.live)
            throw new common_1.NotFoundException('Offer unavailable.');
        const locked = await this.prisma.trade.aggregate({
            where: { offerId, state: { in: ['opened', 'payment_sent', 'payment_confirmed', 'delivery_sent', 'disputed'] } },
            _sum: { lockMinor: true },
        });
        return { offer, free: offer.capacityMinor - (locked._sum.lockMinor ?? 0) };
    }
    async open(dto) {
        if (dto.idemKey) {
            const seen = await this.prisma.trade.findUnique({ where: { idemKey: dto.idemKey } });
            if (seen)
                return seen;
        }
        const { offer, free } = await this.offerCapacity(dto.offerId);
        // Normalise the customer's amount into the offer's provide currency,
        // because min/max/capacity are quoted in provide terms.
        const provideMinor = dto.sellCcy === offer.provide
            ? dto.sendMinor
            : this.rates.convert(dto.sendMinor, dto.sellCcy, offer.provide);
        if (provideMinor === null)
            throw new common_1.BadRequestException('Rate unavailable for this pair right now.');
        if (provideMinor < offer.minMinor || provideMinor > offer.maxMinor)
            throw new common_1.BadRequestException('Amount is outside this offer\u2019s limits.');
        if (provideMinor > free)
            throw new common_1.BadRequestException('This offer cannot cover that amount right now.');
        const recvMinor = Math.round(provideMinor * Number(offer.rate));
        const feeMinor = Math.round((recvMinor * 1.5) / 100);
        return this.prisma.$transaction(async (tx) => {
            const trade = await tx.trade.create({
                data: {
                    offerId: offer.id, customerId: dto.customerId, vendorId: offer.vendorId,
                    sellCcy: dto.sellCcy, recvCcy: dto.recvCcy, sendMinor: dto.sendMinor,
                    recvMinor, feeMinor, lockMinor: provideMinor,
                    rate: offer.rate, state: 'opened', idemKey: dto.idemKey,
                },
            });
            await tx.bondEvent.create({
                data: {
                    bond: { connect: { vendorId: offer.vendorId } },
                    kind: 'reserve', amount: -provideMinor, currency: offer.provide, tradeId: trade.id,
                },
            });
            return trade;
        });
    }
    async recent() {
        return this.prisma.trade.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    }
    async act(id, action, opts = {}) {
        const trade = await this.prisma.trade.findUnique({ where: { id }, include: { offer: true } });
        if (!trade)
            throw new common_1.NotFoundException('Trade not found.');
        if (!(TRANSITIONS[trade.state] || []).includes(action))
            throw new common_1.BadRequestException(`Cannot ${action} a ${trade.state} trade.`);
        if (action === 'pay' && !opts.proofUrl)
            throw new common_1.BadRequestException('Attach your payment receipt first.');
        const next = NEXT[action];
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.trade.update({ where: { id }, data: { state: next } });
            if (opts.text || opts.proofUrl) {
                await tx.message.create({
                    data: { tradeId: id, from: opts.from ?? 'you', text: opts.text ?? '', attachUrl: opts.proofUrl },
                });
            }
            if (next === 'completed' || next === 'cancelled') {
                await tx.bondEvent.create({
                    data: {
                        bond: { connect: { vendorId: trade.vendorId } },
                        kind: next === 'completed' ? 'release' : 'refund',
                        amount: trade.lockMinor, currency: trade.offer.provide, tradeId: id,
                    },
                });
            }
            if (next === 'disputed') {
                await tx.dispute.create({
                    data: { tradeId: id, state: 'OPEN' },
                });
            }
            await tx.auditLog.create({ data: { action: `trade:${action}`, meta: { tradeId: id } } });
            return updated;
        });
    }
};
exports.TradesService = TradesService;
exports.TradesService = TradesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService,
        rates_service_1.RatesService])
], TradesService);
//# sourceMappingURL=trades.service.js.map
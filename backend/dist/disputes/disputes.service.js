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
exports.DisputesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let DisputesService = class DisputesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list() {
        return this.prisma.dispute.findMany({ orderBy: { createdAt: 'desc' }, include: { trade: true } });
    }
    async resolve(id, how, opts = {}) {
        const d = await this.prisma.dispute.findUnique({ where: { id }, include: { trade: { include: { offer: true } } } });
        if (!d)
            throw new common_1.NotFoundException('Case not found.');
        if (d.state !== 'OPEN')
            throw new common_1.BadRequestException('Already resolved.');
        const big = d.trade.sendMinor > (opts.thresholdMinor ?? 500_000);
        if (big && !opts.secondBy) {
            const err = new common_1.BadRequestException('Large amount — second approval required.');
            err.needSecond = true;
            throw err;
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.dispute.update({
                where: { id },
                data: { state: 'RESOLVED-' + how, resolution: how, secondBy: opts.secondBy, resolvedAt: new Date() },
            });
            await tx.trade.update({ where: { id: d.tradeId }, data: { state: 'resolved' } });
            await tx.bondEvent.create({
                data: {
                    bond: { connect: { vendorId: d.trade.vendorId } },
                    // Reserve(-X) already holds the amount. Release/refund (+X) nets
                    // to zero; forfeit converts the hold into a permanent loss, so it
                    // carries 0 and the compensation payout is recorded alongside.
                    kind: how === 'VENDOR-AT-FAULT' ? 'forfeit' : 'release',
                    amount: how === 'VENDOR-AT-FAULT' ? 0 : d.trade.lockMinor,
                    currency: d.trade.offer.provide, tradeId: d.tradeId,
                },
            });
            await tx.auditLog.create({ data: { action: 'dispute:resolve', meta: { id, how } } });
            return updated;
        });
    }
};
exports.DisputesService = DisputesService;
exports.DisputesService = DisputesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DisputesService);
//# sourceMappingURL=disputes.service.js.map
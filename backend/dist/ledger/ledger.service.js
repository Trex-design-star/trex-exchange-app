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
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
/**
 * Append-only money trail. Balances are always derived (sum of events),
 * never stored. Every financial write accepts an idempotency key: a
 * repeated key returns the original entry without a duplicate effect.
 */
let LedgerService = class LedgerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async append(input) {
        if (input.idemKey) {
            const seen = await this.prisma.ledgerEntry.findUnique({
                where: { idemKey: input.idemKey },
            });
            if (seen)
                return { entry: seen, duplicate: true };
        }
        if (input.bondId) {
            await this.prisma.bondEvent.create({
                data: {
                    bondId: input.bondId,
                    kind: input.kind,
                    amount: input.amount,
                    currency: input.currency,
                    tradeId: input.tradeId,
                    idemKey: input.idemKey,
                },
            });
        }
        const entry = await this.prisma.ledgerEntry.create({
            data: {
                kind: input.kind,
                tradeId: input.tradeId,
                amount: input.amount,
                currency: input.currency,
                meta: input.meta,
                idemKey: input.idemKey,
            },
        });
        return { entry, duplicate: false };
    }
    /** Net balance (minor units) for a vendor bond in one currency. */
    async bondBalance(bondId, currency) {
        const agg = await this.prisma.bondEvent.aggregate({
            where: { bondId, currency },
            _sum: { amount: true },
        });
        return agg._sum.amount ?? 0;
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map
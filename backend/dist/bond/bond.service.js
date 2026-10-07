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
exports.BondService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const paystack_service_1 = require("./paystack.service");
const SWITCH_COOLDOWN_MS = 72 * 3600 * 1000;
const SECOND_APPROVAL_MINOR = 500_000_00; // ₦500,000 in kobo — configurable
let BondService = class BondService {
    prisma;
    ledger;
    paystack;
    constructor(prisma, ledger, paystack) {
        this.prisma = prisma;
        this.ledger = ledger;
        this.paystack = paystack;
    }
    async bondFor(vendorId) {
        return this.prisma.bond.upsert({
            where: { vendorId },
            update: {},
            create: { vendorId, model: 'standing', base: 'USD', caps: {} },
        });
    }
    /** Open-trade exposure still locked against this vendor's capacity. */
    async lockedTotal(vendorId) {
        const open = await this.prisma.trade.aggregate({
            where: { vendorId, state: { in: ['opened', 'payment_sent', 'payment_confirmed', 'delivery_sent', 'disputed'] } },
            _sum: { lockMinor: true },
        });
        return open._sum.lockMinor ?? 0;
    }
    async topup(vendorId, currency, amountMinor, idemKey) {
        if (!(amountMinor > 0))
            throw new common_1.BadRequestException('Amount must be above zero.');
        const bond = await this.bondFor(vendorId);
        const { duplicate } = await this.ledger.append({
            kind: 'topup', bondId: bond.id, amount: amountMinor, currency, idemKey,
        });
        const caps = { ...bond.caps };
        if (!duplicate)
            caps[currency] = (caps[currency] ?? 0) + amountMinor;
        await this.prisma.bond.update({ where: { id: bond.id }, data: { caps } });
        return { caps, duplicate };
    }
    async release(vendorId, currency, amountMinor, bank, idemKey, secondBy) {
        if (!(amountMinor > 0))
            throw new common_1.BadRequestException('Amount must be above zero.');
        if (await this.lockedTotal(vendorId))
            throw new common_1.BadRequestException('Withdrawals need zero open trades.');
        const bond = await this.bondFor(vendorId);
        const caps = { ...bond.caps };
        if (amountMinor > (caps[currency] ?? 0))
            throw new common_1.BadRequestException('That exceeds your free balance.');
        if (amountMinor > SECOND_APPROVAL_MINOR && !secondBy)
            throw new common_1.BadRequestException('Large amount — second approval required.');
        // Real payout first; the ledger only moves on Paystack confirmation.
        const recipient = await this.paystack.createRecipient(bank.name, bank.accountNumber, bank.bankCode);
        const reference = idemKey ?? `trex-${Date.now()}`;
        const transfer = await this.paystack.transfer(amountMinor, recipient.recipient_code, reference);
        if (transfer.status !== 'success') {
            // Queued for the retry worker (BullMQ + Redis); never silently dropped.
            await this.prisma.auditLog.create({ data: { actorId: vendorId, action: 'bond:release-queued', meta: { reference, amountMinor, currency } } });
            return { queued: true, reference };
        }
        caps[currency] -= amountMinor;
        await this.prisma.bond.update({ where: { id: bond.id }, data: { caps } });
        await this.ledger.append({ kind: 'release', bondId: bond.id, amount: -amountMinor, currency, idemKey });
        return { caps, reference, transfer: transfer.transfer_code };
    }
    async switchModel(_vendorId) {
        // Removed 2 Oct 2026 (decision 17): per-trade 50% is the only model.
        throw new common_1.BadRequestException('Trex uses one bond model: 50% per trade. Nothing to switch.');
    }
};
exports.BondService = BondService;
exports.BondService = BondService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService,
        paystack_service_1.PaystackService])
], BondService);
//# sourceMappingURL=bond.service.js.map
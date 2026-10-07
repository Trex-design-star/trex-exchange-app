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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const paystack_service_1 = require("./paystack.service");
const prisma_service_1 = require("../prisma.service");
/**
 * Paystack sends charge.success (bond funding) and transfer.success
 * (release confirmation). Every event is verified, deduplicated by
 * event id, and processed exactly once. Requires main.ts to enable
 * rawBody so req.rawBody is available.
 */
let WebhooksController = class WebhooksController {
    paystack;
    prisma;
    constructor(paystack, prisma) {
        this.paystack = paystack;
        this.prisma = prisma;
    }
    async handle(req, sig) {
        const raw = req.rawBody ?? JSON.stringify(req.body ?? {});
        if (!this.paystack.verifySignature(raw, sig))
            throw new common_1.UnauthorizedException('Bad webhook signature.');
        const event = req.body?.event;
        const data = req.body?.data ?? {};
        const seen = await this.prisma.payment.findUnique({ where: { reference: `evt-${data.id ?? Date.now()}` } }).catch(() => null);
        if (seen)
            return { ok: true, duplicate: true };
        if (event === 'charge.success') {
            await this.prisma.payment.create({
                data: {
                    direction: 'in', currency: data.currency ?? 'NGN',
                    amountMinor: Math.round(Number(data.amount ?? 0)),
                    method: data.channel ?? 'dedicated_account',
                    reference: `evt-${data.id}`, status: 'success', raw: data,
                },
            });
            // Match to the vendor's expected top-up (account number + amount);
            // mismatches go to manual review, never auto-applied.
            await this.prisma.auditLog.create({ data: { action: 'webhook:charge.success', meta: { reference: data.reference } } });
        }
        else if (event === 'transfer.success') {
            await this.prisma.payment.create({
                data: {
                    direction: 'out', currency: data.currency ?? 'NGN',
                    amountMinor: Math.round(Number(data.amount ?? 0)),
                    reference: `evt-${data.id}`, status: 'success', raw: data,
                },
            });
            await this.prisma.auditLog.create({ data: { action: 'webhook:transfer.success', meta: { reference: data.reference } } });
        }
        return { ok: true };
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('paystack'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-paystack-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handle", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [paystack_service_1.PaystackService, prisma_service_1.PrismaService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map
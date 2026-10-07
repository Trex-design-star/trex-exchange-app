"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
/** Transactional email for trade events, receipts and security alerts. */
let ResendService = class ResendService {
    resend = new resend_1.Resend(process.env.RESEND_API_KEY ?? '');
    from = process.env.RESEND_FROM ?? 'Trex <hello@example.com>';
    async send(to, subject, text) {
        if (!process.env.RESEND_API_KEY) {
            console.log(`[email-preview] to=${to} subject=${subject}`);
            return { preview: true };
        }
        return this.resend.emails.send({ from: this.from, to, subject, text });
    }
    tradeUpdate(to, pair, state) {
        return this.send(to, `Your ${pair} trade: ${state}`, `Your ${pair} trade is now: ${state}. Open Trex to review.`);
    }
    receipt(to, ref, summary) {
        return this.send(to, `Receipt ${ref}`, summary);
    }
    securityAlert(to, what) {
        return this.send(to, 'Trex security alert', `${what}. If this was not you, open Trex security settings now.`);
    }
};
exports.ResendService = ResendService;
exports.ResendService = ResendService = __decorate([
    (0, common_1.Injectable)()
], ResendService);
//# sourceMappingURL=resend.service.js.map
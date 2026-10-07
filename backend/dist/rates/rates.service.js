"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatesService = void 0;
const common_1 = require("@nestjs/common");
// Decimal places per ISO 4217 (subset used by Trex; extend from registry).
const DECIMALS = {
    JPY: 0, UGX: 0, TZS: 0, RWF: 0, XOF: 0, XAF: 0, CLP: 0,
    KWD: 3, BHD: 3,
};
// Illustrative reference: USD per 1 unit. Replace with the approved
// provider feed (cached in Redis, 60s TTL, stale-banner on miss).
// Pair with Docs/phase6-8-backend.md rate-engine contract.
const REF_USD = {
    USD: 1, EUR: 1.08, GBP: 1.27, NGN: 1 / 1520, CAD: 0.73, AUD: 0.66,
    NZD: 0.61, CHF: 1.12, JPY: 0.0067, CNY: 0.138, HKD: 0.128, SGD: 0.74,
    ZAR: 0.055, KES: 0.0077, GHS: 0.066, INR: 0.012, AED: 0.272,
};
let RatesService = class RatesService {
    decimals(ccy) {
        return DECIMALS[ccy] ?? 2;
    }
    /** Reference rate: 1 unit of `from` in units of `to`. Null when unknown. */
    refRate(from, to) {
        if (from === to)
            return 1;
        const a = REF_USD[from];
        const b = REF_USD[to];
        if (!a || !b)
            return null;
        return a / b;
    }
    /** Convert minor units between currencies at the reference rate. */
    convert(minor, from, to) {
        const rate = this.refRate(from, to);
        if (rate === null)
            return null;
        const major = minor / 10 ** this.decimals(from);
        return Math.round(major * rate * 10 ** this.decimals(to));
    }
};
exports.RatesService = RatesService;
exports.RatesService = RatesService = __decorate([
    (0, common_1.Injectable)()
], RatesService);
//# sourceMappingURL=rates.service.js.map
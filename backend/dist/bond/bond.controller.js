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
exports.BondController = void 0;
const common_1 = require("@nestjs/common");
const bond_service_1 = require("./bond.service");
let BondController = class BondController {
    bond;
    constructor(bond) {
        this.bond = bond;
    }
    topup(b, key) {
        return this.bond.topup(b.vendorId ?? 'demo-vendor', b.currency, Math.round(b.amountMinor), key ?? b.idemKey);
    }
    release(b, key) {
        return this.bond.release(b.vendorId ?? 'demo-vendor', b.currency, Math.round(b.amountMinor), b.bank, key ?? b.idemKey, b.secondBy);
    }
    switch(b) {
        return this.bond.switchModel(b.vendorId ?? 'demo-vendor');
    }
};
exports.BondController = BondController;
__decorate([
    (0, common_1.Post)('topup'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BondController.prototype, "topup", null);
__decorate([
    (0, common_1.Post)('release'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BondController.prototype, "release", null);
__decorate([
    (0, common_1.Post)('switch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BondController.prototype, "switch", null);
exports.BondController = BondController = __decorate([
    (0, common_1.Controller)('bond'),
    __metadata("design:paramtypes", [bond_service_1.BondService])
], BondController);
//# sourceMappingURL=bond.controller.js.map
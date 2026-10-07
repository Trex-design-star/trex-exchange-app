"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("./prisma.service");
const ledger_service_1 = require("./ledger/ledger.service");
const rates_service_1 = require("./rates/rates.service");
const resend_service_1 = require("./notifications/resend.service");
const paystack_service_1 = require("./bond/paystack.service");
const offers_service_1 = require("./offers/offers.service");
const offers_controller_1 = require("./offers/offers.controller");
const trades_service_1 = require("./trades/trades.service");
const trades_controller_1 = require("./trades/trades.controller");
const disputes_service_1 = require("./disputes/disputes.service");
const disputes_controller_1 = require("./disputes/disputes.controller");
const bond_service_1 = require("./bond/bond.service");
const bond_controller_1 = require("./bond/bond.controller");
const webhooks_controller_1 = require("./bond/webhooks.controller");
const admin_controller_1 = require("./admin/admin.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot({ isGlobal: true })],
        controllers: [offers_controller_1.OffersController, trades_controller_1.TradesController, disputes_controller_1.DisputesController, bond_controller_1.BondController, webhooks_controller_1.WebhooksController, admin_controller_1.AdminController],
        providers: [
            prisma_service_1.PrismaService, ledger_service_1.LedgerService, rates_service_1.RatesService, resend_service_1.ResendService, paystack_service_1.PaystackService,
            offers_service_1.OffersService, trades_service_1.TradesService, disputes_service_1.DisputesService, bond_service_1.BondService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
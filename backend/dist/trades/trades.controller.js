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
exports.TradesController = void 0;
const common_1 = require("@nestjs/common");
const trades_service_1 = require("./trades.service");
let TradesController = class TradesController {
    trades;
    constructor(trades) {
        this.trades = trades;
    }
    open(dto, key) {
        return this.trades.open({ ...dto, idemKey: key ?? dto.idemKey });
    }
    list() {
        return this.trades.recent();
    }
    act(id, action, body) {
        return this.trades.act(id, action, body);
    }
};
exports.TradesController = TradesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "open", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/:action'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('action')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "act", null);
exports.TradesController = TradesController = __decorate([
    (0, common_1.Controller)('trades'),
    __metadata("design:paramtypes", [trades_service_1.TradesService])
], TradesController);
//# sourceMappingURL=trades.controller.js.map
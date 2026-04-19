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
exports.NetWorthSnapshot = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let NetWorthSnapshot = class NetWorthSnapshot {
    id;
    userId;
    snapshotDate;
    walletTotal;
    bankTotal;
    investmentTotal;
    receivablesTotal;
    borrowingsTotal;
    creditCardDebtTotal;
    netWorth;
    currency;
    note;
    createdAt;
    user;
};
exports.NetWorthSnapshot = NetWorthSnapshot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], NetWorthSnapshot.prototype, "snapshotDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "walletTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "bankTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "investmentTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "receivablesTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "borrowingsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "creditCardDebtTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], NetWorthSnapshot.prototype, "netWorth", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'VND' }),
    __metadata("design:type", String)
], NetWorthSnapshot.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], NetWorthSnapshot.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NetWorthSnapshot.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], NetWorthSnapshot.prototype, "user", void 0);
exports.NetWorthSnapshot = NetWorthSnapshot = __decorate([
    (0, typeorm_1.Entity)('NetWorthSnapshots')
], NetWorthSnapshot);
//# sourceMappingURL=net-worth-snapshot.entity.js.map
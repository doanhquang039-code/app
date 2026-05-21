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
exports.DailyStatistics = void 0;
const typeorm_1 = require("typeorm");
let DailyStatistics = class DailyStatistics {
    id;
    user_id;
    stat_date;
    total_income;
    total_expense;
    net_amount;
    transaction_count;
    avg_transaction_amount;
    top_category_id;
    top_category_amount;
    created_at;
    updated_at;
};
exports.DailyStatistics = DailyStatistics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DailyStatistics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], DailyStatistics.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], DailyStatistics.prototype, "stat_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyStatistics.prototype, "total_income", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyStatistics.prototype, "total_expense", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyStatistics.prototype, "net_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DailyStatistics.prototype, "transaction_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyStatistics.prototype, "avg_transaction_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], DailyStatistics.prototype, "top_category_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DailyStatistics.prototype, "top_category_amount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DailyStatistics.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DailyStatistics.prototype, "updated_at", void 0);
exports.DailyStatistics = DailyStatistics = __decorate([
    (0, typeorm_1.Entity)('daily_statistics'),
    (0, typeorm_1.Unique)(['user_id', 'stat_date']),
    (0, typeorm_1.Index)(['user_id', 'stat_date']),
    (0, typeorm_1.Index)(['stat_date'])
], DailyStatistics);
//# sourceMappingURL=daily-statistics.entity.js.map
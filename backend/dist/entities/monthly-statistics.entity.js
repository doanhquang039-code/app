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
exports.MonthlyStatistics = void 0;
const typeorm_1 = require("typeorm");
let MonthlyStatistics = class MonthlyStatistics {
    id;
    user_id;
    year;
    month;
    total_income;
    total_expense;
    net_amount;
    transaction_count;
    avg_daily_expense;
    savings_rate;
    budget_adherence;
    created_at;
    updated_at;
};
exports.MonthlyStatistics = MonthlyStatistics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "total_income", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "total_expense", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "net_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "transaction_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "avg_daily_expense", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "savings_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MonthlyStatistics.prototype, "budget_adherence", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MonthlyStatistics.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MonthlyStatistics.prototype, "updated_at", void 0);
exports.MonthlyStatistics = MonthlyStatistics = __decorate([
    (0, typeorm_1.Entity)('monthly_statistics'),
    (0, typeorm_1.Unique)(['user_id', 'year', 'month']),
    (0, typeorm_1.Index)(['user_id', 'year', 'month'])
], MonthlyStatistics);
//# sourceMappingURL=monthly-statistics.entity.js.map
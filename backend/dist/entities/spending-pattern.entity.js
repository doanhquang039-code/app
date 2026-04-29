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
exports.SpendingPattern = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let SpendingPattern = class SpendingPattern {
    id;
    userId;
    user;
    patternType;
    category;
    averageAmount;
    minAmount;
    maxAmount;
    frequency;
    timePattern;
    dayOfWeek;
    dayOfMonth;
    confidence;
    insights;
    periodStart;
    periodEnd;
    occurrences;
    isActive;
    createdAt;
    updatedAt;
};
exports.SpendingPattern = SpendingPattern;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SpendingPattern.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SpendingPattern.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], SpendingPattern.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 100 }),
    __metadata("design:type", String)
], SpendingPattern.prototype, "patternType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 255 }),
    __metadata("design:type", String)
], SpendingPattern.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], SpendingPattern.prototype, "averageAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], SpendingPattern.prototype, "minAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], SpendingPattern.prototype, "maxAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SpendingPattern.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 100 }),
    __metadata("design:type", String)
], SpendingPattern.prototype, "timePattern", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], SpendingPattern.prototype, "dayOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], SpendingPattern.prototype, "dayOfMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], SpendingPattern.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 'MAX' }),
    __metadata("design:type", String)
], SpendingPattern.prototype, "insights", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], SpendingPattern.prototype, "periodStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], SpendingPattern.prototype, "periodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SpendingPattern.prototype, "occurrences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: true }),
    __metadata("design:type", Boolean)
], SpendingPattern.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], SpendingPattern.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'datetime2' }),
    __metadata("design:type", Date)
], SpendingPattern.prototype, "updatedAt", void 0);
exports.SpendingPattern = SpendingPattern = __decorate([
    (0, typeorm_1.Entity)('SpendingPatterns')
], SpendingPattern);
//# sourceMappingURL=spending-pattern.entity.js.map
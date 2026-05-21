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
exports.UserPreference = void 0;
const typeorm_1 = require("typeorm");
let UserPreference = class UserPreference {
    id;
    user_id;
    theme;
    language;
    currency;
    date_format;
    time_format;
    notification_email;
    notification_sms;
    notification_push;
    notification_in_app;
    budget_alert_threshold;
    low_balance_alert;
    weekly_report;
    monthly_report;
    created_at;
    updated_at;
};
exports.UserPreference = UserPreference;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserPreference.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', unique: true }),
    __metadata("design:type", Number)
], UserPreference.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'light' }),
    __metadata("design:type", String)
], UserPreference.prototype, "theme", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'vi' }),
    __metadata("design:type", String)
], UserPreference.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, default: 'VND' }),
    __metadata("design:type", String)
], UserPreference.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'DD/MM/YYYY' }),
    __metadata("design:type", String)
], UserPreference.prototype, "date_format", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: '24h' }),
    __metadata("design:type", String)
], UserPreference.prototype, "time_format", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: true }),
    __metadata("design:type", Boolean)
], UserPreference.prototype, "notification_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], UserPreference.prototype, "notification_sms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: true }),
    __metadata("design:type", Boolean)
], UserPreference.prototype, "notification_push", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: true }),
    __metadata("design:type", Boolean)
], UserPreference.prototype, "notification_in_app", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 80 }),
    __metadata("design:type", Number)
], UserPreference.prototype, "budget_alert_threshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 100000 }),
    __metadata("design:type", Number)
], UserPreference.prototype, "low_balance_alert", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: true }),
    __metadata("design:type", Boolean)
], UserPreference.prototype, "weekly_report", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: true }),
    __metadata("design:type", Boolean)
], UserPreference.prototype, "monthly_report", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserPreference.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserPreference.prototype, "updated_at", void 0);
exports.UserPreference = UserPreference = __decorate([
    (0, typeorm_1.Entity)('user_preferences'),
    (0, typeorm_1.Index)(['user_id'], { unique: true })
], UserPreference);
//# sourceMappingURL=user-preference.entity.js.map
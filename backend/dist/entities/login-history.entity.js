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
exports.LoginHistory = void 0;
const typeorm_1 = require("typeorm");
let LoginHistory = class LoginHistory {
    id;
    user_id;
    login_type;
    ip_address;
    user_agent;
    location;
    device_type;
    is_successful;
    failure_reason;
    created_at;
};
exports.LoginHistory = LoginHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], LoginHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], LoginHistory.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], LoginHistory.prototype, "login_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], LoginHistory.prototype, "ip_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], LoginHistory.prototype, "user_agent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], LoginHistory.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], LoginHistory.prototype, "device_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit' }),
    __metadata("design:type", Boolean)
], LoginHistory.prototype, "is_successful", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], LoginHistory.prototype, "failure_reason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LoginHistory.prototype, "created_at", void 0);
exports.LoginHistory = LoginHistory = __decorate([
    (0, typeorm_1.Entity)('login_history'),
    (0, typeorm_1.Index)(['user_id', 'created_at']),
    (0, typeorm_1.Index)(['ip_address']),
    (0, typeorm_1.Index)(['is_successful'])
], LoginHistory);
//# sourceMappingURL=login-history.entity.js.map
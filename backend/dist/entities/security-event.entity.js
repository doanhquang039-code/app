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
exports.SecurityEvent = void 0;
const typeorm_1 = require("typeorm");
let SecurityEvent = class SecurityEvent {
    id;
    user_id;
    event_type;
    severity;
    description;
    ip_address;
    user_agent;
    is_resolved;
    resolved_at;
    created_at;
};
exports.SecurityEvent = SecurityEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], SecurityEvent.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "event_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "ip_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SecurityEvent.prototype, "user_agent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], SecurityEvent.prototype, "is_resolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], SecurityEvent.prototype, "resolved_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SecurityEvent.prototype, "created_at", void 0);
exports.SecurityEvent = SecurityEvent = __decorate([
    (0, typeorm_1.Entity)('security_events'),
    (0, typeorm_1.Index)(['user_id', 'created_at']),
    (0, typeorm_1.Index)(['severity', 'is_resolved']),
    (0, typeorm_1.Index)(['event_type'])
], SecurityEvent);
//# sourceMappingURL=security-event.entity.js.map
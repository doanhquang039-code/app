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
exports.ErrorLog = void 0;
const typeorm_1 = require("typeorm");
let ErrorLog = class ErrorLog {
    id;
    user_id;
    error_type;
    error_message;
    stack_trace;
    endpoint;
    request_data;
    severity;
    is_resolved;
    resolved_at;
    resolved_by;
    created_at;
};
exports.ErrorLog = ErrorLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], ErrorLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ErrorLog.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "error_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 'MAX', nullable: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 'MAX', nullable: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "stack_trace", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "endpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 'MAX', nullable: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "request_data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], ErrorLog.prototype, "is_resolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], ErrorLog.prototype, "resolved_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ErrorLog.prototype, "resolved_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ErrorLog.prototype, "created_at", void 0);
exports.ErrorLog = ErrorLog = __decorate([
    (0, typeorm_1.Entity)('error_logs'),
    (0, typeorm_1.Index)(['severity', 'is_resolved']),
    (0, typeorm_1.Index)(['created_at']),
    (0, typeorm_1.Index)(['user_id'])
], ErrorLog);
//# sourceMappingURL=error-log.entity.js.map
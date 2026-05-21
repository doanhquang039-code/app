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
exports.ApiLog = void 0;
const typeorm_1 = require("typeorm");
let ApiLog = class ApiLog {
    id;
    user_id;
    endpoint;
    method;
    status_code;
    response_time_ms;
    request_body;
    response_body;
    ip_address;
    user_agent;
    created_at;
};
exports.ApiLog = ApiLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], ApiLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ApiLog.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], ApiLog.prototype, "endpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], ApiLog.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ApiLog.prototype, "status_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ApiLog.prototype, "response_time_ms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 'MAX', nullable: true }),
    __metadata("design:type", String)
], ApiLog.prototype, "request_body", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 'MAX', nullable: true }),
    __metadata("design:type", String)
], ApiLog.prototype, "response_body", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ApiLog.prototype, "ip_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ApiLog.prototype, "user_agent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ApiLog.prototype, "created_at", void 0);
exports.ApiLog = ApiLog = __decorate([
    (0, typeorm_1.Entity)('api_logs'),
    (0, typeorm_1.Index)(['user_id', 'created_at']),
    (0, typeorm_1.Index)(['endpoint']),
    (0, typeorm_1.Index)(['status_code']),
    (0, typeorm_1.Index)(['created_at'])
], ApiLog);
//# sourceMappingURL=api-log.entity.js.map
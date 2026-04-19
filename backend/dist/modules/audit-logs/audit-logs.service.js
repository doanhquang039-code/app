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
exports.AuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("../../entities/audit-log.entity");
let AuditLogsService = class AuditLogsService {
    auditRepo;
    constructor(auditRepo) {
        this.auditRepo = auditRepo;
    }
    async findAll(userId, limit = 50) {
        return this.auditRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async findByEntity(userId, entityType, entityId) {
        return this.auditRepo.find({
            where: { userId, entityType, entityId },
            order: { createdAt: 'DESC' },
        });
    }
    async log(userId, action, entityType, entityId, data) {
        const log = this.auditRepo.create({
            userId,
            action,
            entityType,
            entityId,
            oldValue: data?.oldValue ? JSON.stringify(data.oldValue) : null,
            newValue: data?.newValue ? JSON.stringify(data.newValue) : null,
            ipAddress: data?.ipAddress,
            userAgent: data?.userAgent,
            description: data?.description,
        });
        return this.auditRepo.save(log);
    }
    async getStats(userId) {
        const logs = await this.auditRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 200 });
        const actionCounts = {};
        const entityCounts = {};
        logs.forEach(l => {
            actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
            entityCounts[l.entityType] = (entityCounts[l.entityType] || 0) + 1;
        });
        return { totalLogs: logs.length, actionCounts, entityCounts };
    }
};
exports.AuditLogsService = AuditLogsService;
exports.AuditLogsService = AuditLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditLogsService);
//# sourceMappingURL=audit-logs.service.js.map
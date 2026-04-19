import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly service;
    constructor(service: AuditLogsService);
    findAll(req: any, limit?: number): Promise<import("../../entities/audit-log.entity").AuditLog[]>;
    getStats(req: any): Promise<{
        totalLogs: number;
        actionCounts: {};
        entityCounts: {};
    }>;
    findByEntity(req: any, type: string, id: number): Promise<import("../../entities/audit-log.entity").AuditLog[]>;
}

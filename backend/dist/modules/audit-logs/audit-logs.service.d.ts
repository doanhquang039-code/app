import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
export declare class AuditLogsService {
    private auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    findAll(userId: number, limit?: number): Promise<AuditLog[]>;
    findByEntity(userId: number, entityType: string, entityId: number): Promise<AuditLog[]>;
    log(userId: number, action: string, entityType: string, entityId?: number, data?: {
        oldValue?: any;
        newValue?: any;
        ipAddress?: string;
        userAgent?: string;
        description?: string;
    }): Promise<AuditLog>;
    getStats(userId: number): Promise<{
        totalLogs: number;
        actionCounts: {};
        entityCounts: {};
    }>;
}

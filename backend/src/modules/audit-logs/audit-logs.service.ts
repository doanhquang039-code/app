import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async findAll(userId: number, limit = 50): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByEntity(userId: number, entityType: string, entityId: number): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { userId, entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async log(userId: number, action: string, entityType: string, entityId?: number, data?: {
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    description?: string;
  }): Promise<AuditLog> {
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

  async getStats(userId: number) {
    const logs = await this.auditRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 200 });
    const actionCounts = {};
    const entityCounts = {};
    logs.forEach(l => {
      actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
      entityCounts[l.entityType] = (entityCounts[l.entityType] || 0) + 1;
    });
    return { totalLogs: logs.length, actionCounts, entityCounts };
  }
}

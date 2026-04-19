import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  async findAll(@Req() req, @Query('limit') limit?: number) {
    return this.service.findAll(req.user.id, limit || 50);
  }

  @Get('stats')
  async getStats(@Req() req) {
    return this.service.getStats(req.user.id);
  }

  @Get('entity')
  async findByEntity(@Req() req, @Query('type') type: string, @Query('id') id: number) {
    return this.service.findByEntity(req.user.id, type, id);
  }
}

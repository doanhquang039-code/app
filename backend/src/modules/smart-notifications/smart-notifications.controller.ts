import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { SmartNotificationsService } from './smart-notifications.service';
import { CreateSmartNotificationDto, CreateNotificationRuleDto, UpdateNotificationRuleDto } from './dto/smart-notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('smart-notifications')
export class SmartNotificationsController {
  constructor(private readonly smartNotificationsService: SmartNotificationsService) {}

  // Notification endpoints
  @Get()
  findAll(@Request() req, @Query('unreadOnly') unreadOnly: boolean) {
    return this.smartNotificationsService.findAll(req.user.id, unreadOnly === true);
  }

  @Get('stats/unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.smartNotificationsService.getUnreadCount(req.user.id);
    return { unreadCount: count };
  }

  @Get('stats/notification-stats')
  async getStats(@Request() req) {
    const stats = await this.smartNotificationsService.getNotificationStats(req.user.id);
    return stats;
  }

  @Get('stats/trends')
  async getNotificationTrends(@Request() req, @Query('days') days: number = 7) {
    const trends = await this.smartNotificationsService.getNotificationTrends(req.user.id, days);
    return { trends };
  }

  @Get('type/:type')
  getByType(@Param('type') type: string, @Request() req) {
    return this.smartNotificationsService.getByType(req.user.id, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.smartNotificationsService.findOne(+id, req.user.id);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.smartNotificationsService.markAsRead(+id, req.user.id);
  }

  @Put('all/read')
  markAllAsRead(@Request() req) {
    return this.smartNotificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.smartNotificationsService.delete(+id, req.user.id);
  }

  @Delete('old/:days')
  deleteOlderThan(@Param('days') days: string, @Request() req) {
    return this.smartNotificationsService.deleteOlderThan(req.user.id, +days);
  }

  // Notification Rules endpoints
  @Post('rules')
  createRule(@Request() req, @Body() createRuleDto: CreateNotificationRuleDto) {
    return this.smartNotificationsService.createRule(req.user.id, createRuleDto);
  }

  @Get('rules/all')
  findAllRules(@Request() req) {
    return this.smartNotificationsService.findAllRules(req.user.id);
  }

  @Get('rules/active')
  getActiveRules(@Request() req, @Query('ruleType') ruleType?: string) {
    return this.smartNotificationsService.getActiveRules(req.user.id, ruleType);
  }

  @Get('rules/:id')
  findOneRule(@Param('id') id: string, @Request() req) {
    return this.smartNotificationsService.findOneRule(+id, req.user.id);
  }

  @Put('rules/:id')
  updateRule(
    @Param('id') id: string,
    @Request() req,
    @Body() updateRuleDto: UpdateNotificationRuleDto,
  ) {
    return this.smartNotificationsService.updateRule(+id, req.user.id, updateRuleDto);
  }

  @Put('rules/:id/toggle')
  toggleRuleStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() { isEnabled }: { isEnabled: boolean },
  ) {
    return this.smartNotificationsService.toggleRuleStatus(+id, req.user.id, isEnabled);
  }

  @Delete('rules/:id')
  deleteRule(@Param('id') id: string, @Request() req) {
    return this.smartNotificationsService.deleteRule(+id, req.user.id);
  }
}

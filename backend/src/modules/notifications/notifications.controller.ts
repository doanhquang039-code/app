import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send-reminder')
  sendReminder(@Request() req) {
    return this.notificationsService.sendManualReminder(req.user.id);
  }
}

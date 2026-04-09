import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmartNotification, NotificationRule } from '../../entities/smart-notification.entity';
import { SmartNotificationsService } from './smart-notifications.service';
import { SmartNotificationsController } from './smart-notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SmartNotification, NotificationRule])],
  controllers: [SmartNotificationsController],
  providers: [SmartNotificationsService],
  exports: [SmartNotificationsService],
})
export class SmartNotificationsModule {}

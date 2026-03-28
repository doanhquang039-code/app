import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillRemindersService } from './bill-reminders.service';
import { BillRemindersController } from './bill-reminders.controller';
import { BillReminder } from '../../entities/bill-reminder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillReminder])],
  providers: [BillRemindersService],
  controllers: [BillRemindersController],
  exports: [BillRemindersService],
})
export class BillRemindersModule {}

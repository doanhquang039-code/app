import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BillRemindersService } from './bill-reminders.service';
import { CreateBillReminderDto } from './dto/create-bill-reminder.dto';
import { UpdateBillReminderDto } from './dto/update-bill-reminder.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bill-reminders')
export class BillRemindersController {
  constructor(private billRemindersService: BillRemindersService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateBillReminderDto) {
    return this.billRemindersService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req, @Query('status') status?: string) {
    return this.billRemindersService.findAll(req.user.userId, status);
  }

  @Get('upcoming')
  getUpcoming(@Request() req) {
    return this.billRemindersService.getUpcomingBills(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.billRemindersService.findOne(req.user.userId, +id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateBillReminderDto,
  ) {
    return this.billRemindersService.update(req.user.userId, +id, dto);
  }

  @Patch(':id/pay')
  markAsPaid(@Request() req, @Param('id') id: string) {
    return this.billRemindersService.markAsPaid(req.user.userId, +id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.billRemindersService.remove(req.user.userId, +id);
  }
}

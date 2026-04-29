import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScheduledTransactionsService } from './scheduled-transactions.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Scheduled Transactions')
@ApiBearerAuth()
@Controller('scheduled-transactions')
@UseGuards(JwtAuthGuard)
export class ScheduledTransactionsController {
  constructor(
    private readonly scheduledService: ScheduledTransactionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo giao dịch định kỳ' })
  async create(@Request() req, @Body() data: any) {
    return await this.scheduledService.create(req.user.userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách giao dịch định kỳ' })
  async findAll(@Request() req) {
    return await this.scheduledService.findAll(req.user.userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Lấy giao dịch sắp thực hiện' })
  async getUpcoming(@Request() req) {
    return await this.scheduledService.getUpcoming(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết giao dịch định kỳ' })
  async findOne(@Request() req, @Param('id') id: number) {
    return await this.scheduledService.findOne(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật giao dịch định kỳ' })
  async update(@Request() req, @Param('id') id: number, @Body() data: any) {
    return await this.scheduledService.update(req.user.userId, id, data);
  }

  @Put(':id/pause')
  @ApiOperation({ summary: 'Tạm dừng giao dịch định kỳ' })
  async pause(@Request() req, @Param('id') id: number) {
    return await this.scheduledService.pause(req.user.userId, id);
  }

  @Put(':id/resume')
  @ApiOperation({ summary: 'Tiếp tục giao dịch định kỳ' })
  async resume(@Request() req, @Param('id') id: number) {
    return await this.scheduledService.resume(req.user.userId, id);
  }

  @Post(':id/execute-now')
  @ApiOperation({ summary: 'Thực hiện ngay' })
  async executeNow(@Request() req, @Param('id') id: number) {
    return await this.scheduledService.executeNow(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa giao dịch định kỳ' })
  async remove(@Request() req, @Param('id') id: number) {
    await this.scheduledService.remove(req.user.userId, id);
    return { success: true, message: 'Đã xóa giao dịch định kỳ' };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VoiceCommandsService } from './voice-commands.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Voice Commands')
@ApiBearerAuth()
@Controller('voice-commands')
@UseGuards(JwtAuthGuard)
export class VoiceCommandsController {
  constructor(private readonly voiceService: VoiceCommandsService) {}

  @Post('process')
  @ApiOperation({ summary: 'Xử lý lệnh giọng nói' })
  async processCommand(@Request() req, @Body() data: { text: string; language?: string }) {
    return await this.voiceService.processCommand(req.user.userId, data.text, data.language);
  }

  @Get('history')
  @ApiOperation({ summary: 'Lấy lịch sử lệnh giọng nói' })
  async getHistory(@Request() req) {
    return await this.voiceService.getHistory(req.user.userId);
  }

  @Get('supported-intents')
  @ApiOperation({ summary: 'Lấy danh sách intent hỗ trợ' })
  getSupportedIntents() {
    return this.voiceService.getSupportedIntents();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết lệnh giọng nói' })
  async findOne(@Request() req, @Param('id') id: number) {
    return await this.voiceService.findOne(req.user.userId, id);
  }
}

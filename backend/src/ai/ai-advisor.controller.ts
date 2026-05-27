import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AIAdvisorService } from './ai-advisor.service';

class ChatMessageDto {
  message: string;
}

@ApiTags('ai-advisor')
@ApiBearerAuth('JWT')
@Controller('ai-advisor')
@UseGuards(JwtAuthGuard)
export class AIAdvisorController {
  constructor(private readonly aiAdvisorService: AIAdvisorService) {}

  @Get('insights')
  @ApiOperation({ summary: 'Lấy insight tài chính từ AI' })
  async getInsights(@Request() req) {
    return this.aiAdvisorService.getFinancialInsights(req.user.userId);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat với AI advisor' })
  async chat(@Request() req, @Body() dto: ChatMessageDto) {
    const response = await this.aiAdvisorService.getChatbotResponse(
      req.user.userId,
      dto.message,
    );
    return { response };
  }
}

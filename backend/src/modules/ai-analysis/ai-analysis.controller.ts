import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AIAnalysisService } from './ai-analysis.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('AI Analysis')
@ApiBearerAuth()
@Controller('ai-analysis')
@UseGuards(JwtAuthGuard)
export class AIAnalysisController {
  constructor(private readonly aiAnalysisService: AIAnalysisService) {}

  @Post('patterns/analyze')
  @ApiOperation({ summary: 'Phân tích mẫu chi tiêu (chạy AI analysis)' })
  async analyzePatterns(@Request() req, @Query('months') months?: string) {
    const patterns = await this.aiAnalysisService.analyzeSpendingPatterns(
      req.user.userId,
      months ? Number(months) : 6,
    );

    return {
      success: true,
      message: `Đã phát hiện ${patterns.length} mẫu chi tiêu`,
      patterns,
    };
  }

  @Get('patterns')
  @ApiOperation({ summary: 'Lấy danh sách mẫu chi tiêu đã phát hiện' })
  async getPatterns(@Request() req) {
    return await this.aiAnalysisService.getUserPatterns(req.user.userId);
  }

  @Post('anomalies/detect')
  @ApiOperation({ summary: 'Phát hiện chi tiêu bất thường' })
  async detectAnomalies(@Request() req) {
    const anomalies = await this.aiAnalysisService.detectAnomalies(req.user.userId);

    return {
      success: true,
      message: `Phát hiện ${anomalies.length} giao dịch bất thường`,
      anomalies,
    };
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Lấy danh sách chi tiêu bất thường' })
  async getAnomalies(@Request() req, @Query('status') status?: string) {
    return await this.aiAnalysisService.getUserAnomalies(req.user.userId, status);
  }

  @Put('anomalies/:anomalyId/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái chi tiêu bất thường' })
  async updateAnomalyStatus(
    @Request() req,
    @Param('anomalyId') anomalyId: number,
    @Body() data: { status: string; note?: string },
  ) {
    return await this.aiAnalysisService.updateAnomalyStatus(
      req.user.userId,
      anomalyId,
      data.status,
      data.note,
    );
  }

  @Post('predictions/generate')
  @ApiOperation({ summary: 'Tạo dự đoán chi tiêu' })
  async generatePredictions(@Request() req) {
    const predictions = await this.aiAnalysisService.generatePredictions(req.user.userId);

    return {
      success: true,
      message: `Đã tạo ${predictions.length} dự đoán`,
      predictions,
    };
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Lấy danh sách dự đoán' })
  async getPredictions(@Request() req) {
    return await this.aiAnalysisService.getUserPredictions(req.user.userId);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Lấy tổng hợp insights từ AI' })
  async getInsights(@Request() req) {
    const patterns = await this.aiAnalysisService.getUserPatterns(req.user.userId);
    const anomalies = await this.aiAnalysisService.getUserAnomalies(req.user.userId, 'UNREVIEWED');
    const predictions = await this.aiAnalysisService.getUserPredictions(req.user.userId);

    return {
      summary: {
        patternsDetected: patterns.length,
        anomaliesFound: anomalies.length,
        predictionsGenerated: predictions.length,
      },
      patterns: patterns.slice(0, 5), // Top 5 patterns
      recentAnomalies: anomalies.slice(0, 5), // Top 5 anomalies
      upcomingPredictions: predictions.slice(0, 5), // Top 5 predictions
      recommendations: this.generateTopRecommendations(patterns, anomalies, predictions),
    };
  }

  private generateTopRecommendations(patterns: any[], anomalies: any[], predictions: any[]): Array<{
    type: string;
    priority: string;
    message: string;
    action: string;
  }> {
    const recommendations: Array<{
      type: string;
      priority: string;
      message: string;
      action: string;
    }> = [];

    // High severity anomalies
    const criticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
    if (criticalAnomalies.length > 0) {
      recommendations.push({
        type: 'ALERT',
        priority: 'HIGH',
        message: `Phát hiện ${criticalAnomalies.length} giao dịch bất thường cần xem xét`,
        action: 'Kiểm tra chi tiết trong mục Anomalies',
      });
    }

    // Increasing trends
    const increasingTrends = patterns.filter(p => {
      try {
        const insights = JSON.parse(p.insights);
        return insights.direction === 'INCREASING';
      } catch {
        return false;
      }
    });

    if (increasingTrends.length > 0) {
      recommendations.push({
        type: 'WARNING',
        priority: 'MEDIUM',
        message: `${increasingTrends.length} danh mục có xu hướng chi tiêu tăng`,
        action: 'Cân nhắc điều chỉnh ngân sách',
      });
    }

    // High confidence predictions
    const highConfidencePredictions = predictions.filter(p => p.confidence > 80);
    if (highConfidencePredictions.length > 0) {
      const totalPredicted = highConfidencePredictions.reduce(
        (sum, p) => sum + parseFloat(p.predictedAmount.toString()),
        0,
      );
      recommendations.push({
        type: 'INFO',
        priority: 'MEDIUM',
        message: `Dự kiến chi tiêu tháng tới: ${Math.round(totalPredicted).toLocaleString()}đ`,
        action: 'Lập kế hoạch ngân sách phù hợp',
      });
    }

    return recommendations;
  }
}

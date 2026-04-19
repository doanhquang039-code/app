import { Controller, Get, Post, Query, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NetWorthService } from './net-worth.service';
import { CaptureSnapshotDto } from './dto/capture-snapshot.dto';

@Controller('net-worth')
@UseGuards(JwtAuthGuard)
export class NetWorthController {
  constructor(private readonly netWorthService: NetWorthService) {}

  @Get('current')
  async current(@Req() req: { user: { userId: number } }) {
    return this.netWorthService.computeBreakdown(req.user.userId);
  }

  @Post('snapshots')
  async capture(
    @Req() req: { user: { userId: number } },
    @Body() body: CaptureSnapshotDto,
  ) {
    return this.netWorthService.captureSnapshot(req.user.userId, body?.note);
  }

  @Get('snapshots')
  async list(
    @Req() req: { user: { userId: number } },
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('latest') latest?: string,
  ) {
    if (latest === '1' || latest === 'true') {
      return this.netWorthService.findLatest(req.user.userId, 24);
    }
    return this.netWorthService.findRange(req.user.userId, from, to);
  }
}

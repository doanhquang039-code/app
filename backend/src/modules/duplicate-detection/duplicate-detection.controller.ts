import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DuplicateDetectionService } from './duplicate-detection.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('duplicate-detection')
export class DuplicateDetectionController {
  constructor(private duplicateDetectionService: DuplicateDetectionService) {}

  @Get()
  detectDuplicates(
    @Request() req,
    @Query('timeDiffMinutes') timeDiffMinutes?: string,
    @Query('amountTolerance') amountTolerance?: string,
  ) {
    return this.duplicateDetectionService.detectDuplicates(req.user.userId, {
      timeDiffMinutes: timeDiffMinutes ? parseInt(timeDiffMinutes) : 30,
      amountTolerance: amountTolerance ? parseFloat(amountTolerance) : 0,
    });
  }

  @Get('transaction/:transactionId')
  findSimilar(@Request() req, @Param('transactionId') transactionId: string) {
    return this.duplicateDetectionService.findSimilar(req.user.userId, +transactionId);
  }
}

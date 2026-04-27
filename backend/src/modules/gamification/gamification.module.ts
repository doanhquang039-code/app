import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { UserPoints } from '../../entities/user-points.entity';
import { PointsHistory } from '../../entities/points-history.entity';
import { Achievement } from '../../entities/achievement.entity';
import { UserAchievement } from '../../entities/user-achievement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPoints,
      PointsHistory,
      Achievement,
      UserAchievement,
    ]),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}

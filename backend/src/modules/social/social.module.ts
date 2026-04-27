import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { UserFriend } from '../../entities/user-friend.entity';
import { SpendingChallenge } from '../../entities/spending-challenge.entity';
import { ChallengeParticipant } from '../../entities/challenge-participant.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserFriend,
      SpendingChallenge,
      ChallengeParticipant,
      User,
    ]),
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}

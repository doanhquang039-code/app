import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoiceCommandsController } from './voice-commands.controller';
import { VoiceCommandsService } from './voice-commands.service';
import { VoiceCommand } from '../../entities/voice-command.entity';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VoiceCommand, Transaction])],
  controllers: [VoiceCommandsController],
  providers: [VoiceCommandsService],
  exports: [VoiceCommandsService],
})
export class VoiceCommandsModule {}

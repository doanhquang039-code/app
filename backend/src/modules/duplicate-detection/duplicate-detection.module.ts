import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DuplicateDetectionService } from './duplicate-detection.service';
import { DuplicateDetectionController } from './duplicate-detection.controller';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [DuplicateDetectionService],
  controllers: [DuplicateDetectionController],
  exports: [DuplicateDetectionService],
})
export class DuplicateDetectionModule {}

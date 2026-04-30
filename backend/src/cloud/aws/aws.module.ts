import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './s3.service';
import { LambdaService } from './lambda.service';
import { SQSService } from './sqs.service';

@Module({
  imports: [ConfigModule],
  providers: [S3Service, LambdaService, SQSService],
  exports: [S3Service, LambdaService, SQSService],
})
export class AWSModule {}

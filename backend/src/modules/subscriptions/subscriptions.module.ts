import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionPayment } from '../../entities/subscription-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, SubscriptionPayment]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}

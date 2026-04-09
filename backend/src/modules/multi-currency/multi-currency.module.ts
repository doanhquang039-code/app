import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency, MultiCurrencyWallet, ExchangeRateHistory } from '../../entities/multi-currency.entity';
import { MultiCurrencyService } from './multi-currency.service';
import { MultiCurrencyController } from './multi-currency.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Currency, MultiCurrencyWallet, ExchangeRateHistory])],
  controllers: [MultiCurrencyController],
  providers: [MultiCurrencyService],
  exports: [MultiCurrencyService],
})
export class MultiCurrencyModule {}

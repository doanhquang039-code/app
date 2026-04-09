import { Controller, Get, Post, Put, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { MultiCurrencyService } from './multi-currency.service';
import { CreateCurrencyDto, CreateMultiWalletDto, UpdateExchangeRateDto } from './dto/multi-currency.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('multi-currency')
export class MultiCurrencyController {
  constructor(private readonly multiCurrencyService: MultiCurrencyService) {}

  // Currency endpoints (public)
  @Get('currencies')
  getAllCurrencies() {
    return this.multiCurrencyService.getAllCurrencies();
  }

  @Get('currencies/:code')
  getCurrency(@Param('code') code: string) {
    return this.multiCurrencyService.getCurrency(code);
  }

  @Post('currencies')
  createCurrency(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.multiCurrencyService.createCurrency(createCurrencyDto);
  }

  @Put('currencies/:code/exchange-rate')
  updateExchangeRate(@Param('code') code: string, @Body() updateRateDto: UpdateExchangeRateDto) {
    return this.multiCurrencyService.updateExchangeRate(code, updateRateDto);
  }

  @Get('convert')
  async convertCurrency(
    @Query('amount') amount: number,
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
  ) {
    return this.multiCurrencyService.convertCurrency(amount, fromCurrency, toCurrency);
  }

  // Multi-Currency Wallet endpoints (protected)
  @UseGuards(JwtAuthGuard)
  @Post('wallets')
  createMultiWallet(@Request() req, @Body() createWalletDto: CreateMultiWalletDto) {
    return this.multiCurrencyService.createMultiCurrencyWallet(req.user.id, createWalletDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallets/:walletId/currencies')
  getWalletCurrencies(@Param('walletId') walletId: string, @Request() req) {
    return this.multiCurrencyService.getWalletCurrencies(req.user.id, +walletId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('wallets/:walletId/currencies/:currencyCode/balance')
  updateWalletBalance(
    @Param('walletId') walletId: string,
    @Param('currencyCode') currencyCode: string,
    @Request() req,
    @Body() { balance }: { balance: number },
  ) {
    return this.multiCurrencyService.updateWalletBalance(req.user.id, +walletId, currencyCode, balance);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallets/:walletId/total-usd')
  async getTotalInUSD(@Param('walletId') walletId: string, @Request() req) {
    const total = await this.multiCurrencyService.getTotalWalletBalanceInUSD(req.user.id, +walletId);
    return { totalInUSD: total };
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallets/:walletId/total')
  async getTotalInCurrency(
    @Param('walletId') walletId: string,
    @Request() req,
    @Query('currency') currency: string = 'USD',
  ) {
    const total = await this.multiCurrencyService.getTotalWalletBalanceInCurrency(req.user.id, +walletId, currency);
    return { [currency]: total };
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallets/:walletId/report')
  getBalanceReport(@Param('walletId') walletId: string, @Request() req) {
    return this.multiCurrencyService.getMultiCurrencyBalanceReport(req.user.id, +walletId);
  }

  @Get('exchange-history')
  getExchangeHistory(
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
    @Query('days') days: number = 30,
  ) {
    return this.multiCurrencyService.getExchangeRateHistory(fromCurrency, toCurrency, days);
  }
}

import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsNumber()
  @Min(0.00000001)
  exchangeRate: number;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateExchangeRateDto {
  @IsNumber()
  @Min(0.00000001)
  exchangeRate: number;
}

export class CreateMultiWalletDto {
  @IsNumber()
  walletId: number;

  @IsString()
  currencyCode: string;

  @IsOptional()
  @IsNumber()
  balance?: number;
}

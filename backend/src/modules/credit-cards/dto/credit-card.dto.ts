import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateCreditCardDto {
  @IsString()
  cardholderName: string;

  @IsString()
  cardNumber: string;

  @IsString()
  cardType: string;

  @IsString()
  issuingBank: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth: number;

  @IsNumber()
  @Min(2024)
  expiryYear: number;

  @IsString()
  cvv: string;

  @IsNumber()
  creditLimit: number;

  @IsOptional()
  @IsNumber()
  currentBalance?: number;

  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  billingCycleDayOfMonth?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  linkedWalletId?: number;
}

export class UpdateCreditCardDto {
  @IsOptional()
  @IsString()
  cardholderName?: string;

  @IsOptional()
  @IsString()
  cardType?: string;

  @IsOptional()
  @IsNumber()
  currentBalance?: number;

  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  billingCycleDayOfMonth?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  linkedWalletId?: number;
}

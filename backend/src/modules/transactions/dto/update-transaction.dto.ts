import { IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  walletId?: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
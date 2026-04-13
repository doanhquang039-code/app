import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTransactionDto {
  @IsOptional()
  @IsString()
  month?: string; // format: "2024-02"

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  type?: string; // 'income' | 'expense'

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  walletId?: number;

  @IsOptional()
  @IsString()
  startDate?: string; // ISO date string

  @IsOptional()
  @IsString()
  endDate?: string; // ISO date string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
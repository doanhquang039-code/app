import { IsString, IsNumber, IsDate, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecurringTransactionDto {
  @IsNumber()
  walletId: number;

  @IsNumber()
  categoryId: number;

  @IsNumber()
  amount: number;

  @IsEnum(['income', 'expense'])
  type: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsEnum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])
  frequency: string;

  @IsOptional()
  @IsString()
  frequencyDay?: string; // Day of month (1-31) or days of week (0-6)

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

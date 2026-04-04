import { IsOptional, IsString, IsEnum } from 'class-validator';

export class QueryRecurringTransactionDto {
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])
  frequency?: string;

  @IsOptional()
  @IsString()
  isActive?: string;
}

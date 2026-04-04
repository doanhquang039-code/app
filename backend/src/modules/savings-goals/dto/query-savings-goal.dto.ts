import { IsOptional, IsString, IsNumber } from 'class-validator';

export class QuerySavingsGoalDto {
  @IsOptional()
  @IsString()
  status?: string; // 'active', 'completed', 'paused', 'cancelled'

  @IsOptional()
  @IsNumber()
  walletId?: number;
}

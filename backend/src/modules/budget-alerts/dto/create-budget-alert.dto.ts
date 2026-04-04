import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateBudgetAlertDto {
  @IsNumber()
  budgetId: number;

  @IsNumber()
  thresholdPercentage: number; // 50-100

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

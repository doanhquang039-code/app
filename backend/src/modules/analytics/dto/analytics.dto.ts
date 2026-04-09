import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateAnalyticsDto {
  @IsNumber()
  totalIncome: number;

  @IsNumber()
  totalExpense: number;

  @IsNumber()
  savingsAmount: number;

  @IsOptional()
  @IsNumber()
  savingsRatePercentage?: number;

  @IsOptional()
  @IsString()
  categoryBreakdown?: string;

  @IsOptional()
  @IsString()
  trends?: string;
}

export class CreateForecastDto {
  @IsNumber()
  categoryId: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @Min(2024)
  year: number;

  @IsNumber()
  predictedAmount: number;

  @IsOptional()
  @IsNumber()
  confidence?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;
}

import { IsNumber, IsString, Matches, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  categoryId: number;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month phải có format YYYY-MM' })
  month: string;
}

import { IsNumber, IsString, IsOptional, Matches, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsNumber()
  @Min(1)
  amount: number;

  /**
   * Tháng áp dụng, format YYYY-MM.
   * Nếu không truyền thì tự lấy từ startDate hoặc tháng hiện tại.
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month phải có format YYYY-MM' })
  month?: string;

  /**
   * Flutter có thể gửi startDate thay vì month.
   * Backend sẽ tự convert sang month (YYYY-MM).
   */
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  period?: string; // 'monthly' | 'weekly' | 'yearly'
}

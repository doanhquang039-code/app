import { IsNumber, Min, Max } from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @Min(2024)
  year: number;
}

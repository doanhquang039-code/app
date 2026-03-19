import { IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  walletId: number;

  @IsNumber()
  categoryId: number;

  @IsNumber()
  amount: number;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsDateString()
  date: string;
}
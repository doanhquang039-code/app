import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsString()
  icon?: string;
}

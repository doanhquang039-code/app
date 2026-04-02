import { IsNumber, Min } from 'class-validator';

export class TransferWalletDto {
  @IsNumber()
  fromWalletId: number;

  @IsNumber()
  toWalletId: number;

  @IsNumber()
  @Min(1)
  amount: number;
}

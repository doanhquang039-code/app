import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto';

export class BulkImportTransactionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionDto)
  @ArrayMaxSize(500)
  items: CreateTransactionDto[];
}

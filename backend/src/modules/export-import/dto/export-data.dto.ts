import { IsEnum, IsOptional, IsDateString, IsArray } from 'class-validator';

export enum ExportType {
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  PDF = 'PDF',
  JSON = 'JSON',
}

export enum DataType {
  TRANSACTIONS = 'TRANSACTIONS',
  BUDGETS = 'BUDGETS',
  SAVINGS_GOALS = 'SAVINGS_GOALS',
  BILLS = 'BILLS',
  BANK_ACCOUNTS = 'BANK_ACCOUNTS',
  CREDIT_CARDS = 'CREDIT_CARDS',
  REPORTS = 'REPORTS',
  ALL = 'ALL',
}

export class ExportDataDto {
  @IsEnum(ExportType)
  exportType: ExportType;

  @IsEnum(DataType)
  dataType: DataType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  categoryIds?: number[];

  @IsOptional()
  @IsArray()
  walletIds?: number[];

  @IsOptional()
  includeAttachments?: boolean;
}

export class ImportDataDto {
  @IsEnum(DataType)
  dataType: DataType;

  @IsOptional()
  overwriteExisting?: boolean;

  @IsOptional()
  skipDuplicates?: boolean;
}

import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  groupName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  groupName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateSharedExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  splits: string; // JSON string with userId: amount pairs

  @IsOptional()
  @IsString()
  date?: string;
}

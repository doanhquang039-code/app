import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSmartNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  metadata?: string;
}

export class CreateNotificationRuleDto {
  @IsString()
  ruleName: string;

  @IsString()
  ruleType: string;

  @IsString()
  condition: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  notificationChannel?: string;
}

export class UpdateNotificationRuleDto {
  @IsOptional()
  @IsString()
  ruleName?: string;

  @IsOptional()
  @IsString()
  ruleType?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  notificationChannel?: string;
}

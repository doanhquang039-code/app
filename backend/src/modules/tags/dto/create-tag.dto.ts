import { IsString, IsOptional } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  color?: string; // Hex color code like #FF5733

  @IsOptional()
  @IsString()
  icon?: string;
}

import { IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string; // username hoặc email đều được chấp nhận

  @IsString()
  password: string;
}
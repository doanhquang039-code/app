import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CaptureSnapshotDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

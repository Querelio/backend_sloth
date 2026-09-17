import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  subject?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  classId?: number | null;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contractId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  statusId?: number;

  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  start: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  end: string;

  @IsOptional()
  @IsString()
  declarationReference?: string | null;
}

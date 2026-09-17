import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateClassDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  institutionId: number;

  @IsString()
  @IsNotEmpty()
  classLevel: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  studentCount: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

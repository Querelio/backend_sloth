import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateContractDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  institutionId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  pricingModeId: number;

  @IsString()
  @IsNotEmpty()
  contractNumber: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyVolumePlanned: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;
}

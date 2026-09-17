import { ApiProperty } from '@nestjs/swagger';

export class CreatedResourceDto {
  @ApiProperty({ example: 1 })
  id: number;
}

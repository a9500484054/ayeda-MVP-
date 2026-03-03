import { ApiProperty } from '@nestjs/swagger';
import { UnitType } from '../entities/unit.entity';

export class UnitResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'kg' })
  code: string;

  @ApiProperty({ example: 'килограмм' })
  name: string;

  @ApiProperty({ example: 'кг' })
  short: string;

  @ApiProperty({ enum: UnitType, example: UnitType.MASS })
  type: UnitType;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

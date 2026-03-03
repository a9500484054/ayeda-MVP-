import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { UnitType } from '../entities/unit.entity';

export class CreateUnitDto {
  @ApiProperty({
    example: 'kg',
    description: 'Уникальный код единицы измерения',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @Matches(/^[a-z]+$/, {
    message: 'Код должен содержать только латинские буквы в нижнем регистре',
  })
  code: string;

  @ApiProperty({ example: 'килограмм', description: 'Название' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'кг', description: 'Краткое обозначение' })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  short: string;

  @ApiProperty({ enum: UnitType, example: UnitType.MASS })
  @IsEnum(UnitType)
  type: UnitType;
}

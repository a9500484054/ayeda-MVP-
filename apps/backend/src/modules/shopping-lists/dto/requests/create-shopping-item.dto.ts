import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  MaxLength,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShoppingItemDto {
  @ApiProperty({ example: 'Помидоры' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ required: false, description: 'UUID категории' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ required: false, default: 1, example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity?: number;

  @ApiProperty({ required: false, default: 'шт', example: 'кг' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiProperty({ required: false, example: 100.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

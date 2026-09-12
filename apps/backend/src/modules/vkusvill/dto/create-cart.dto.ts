import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ArrayMaxSize,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @ApiProperty({ example: 'Агавовый сироп' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity?: number;

  @ApiProperty({ example: 'мл', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;
}

export class CreateCartDto {
  @ApiProperty({ type: [CartItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @ApiProperty({ example: 4.7, required: false, default: 4.7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minRating?: number;
}

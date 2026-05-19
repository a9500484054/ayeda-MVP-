import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShoppingListDto {
  @ApiProperty({ example: 'Продукты на неделю' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}

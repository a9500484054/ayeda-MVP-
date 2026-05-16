import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateDayDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(30)
  dayOrder: number;

  @ApiProperty({ example: 'День 1' })
  @IsString()
  title: string;
}

export class UpdateDayDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;
}

export class ReorderDaysDto {
  @ApiProperty({ type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, order: { type: 'number' } } } })
  items: Array<{ id: string; order: number }>;
}

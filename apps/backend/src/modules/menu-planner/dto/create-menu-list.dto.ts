// apps\backend\src\modules\menu-planner\dto\create-menu-list.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength, MinLength, IsEnum } from 'class-validator';
import { DisplayType } from '../enums/display-type.enum';

export class CreateMenuListDto {
  @ApiProperty({ example: 'Семейное меню' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: '🍕' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: DisplayType, default: DisplayType.DAYS, required: false })
  @IsOptional()
  @IsEnum(DisplayType)
  displayType?: DisplayType;
}

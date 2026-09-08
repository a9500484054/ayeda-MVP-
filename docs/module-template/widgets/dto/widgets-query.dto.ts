import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { WidgetStatus } from '../entities/widget.entity';

// Фильтры списка + пагинация. page/limit приходят из PaginationDto
// уже приведёнными к number (@Type + transform).
export class WidgetsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: WidgetStatus })
  @IsOptional()
  @IsEnum(WidgetStatus)
  status?: WidgetStatus;

  @ApiPropertyOptional({ description: 'Поиск по title (ILIKE)' })
  @IsOptional()
  @IsString()
  q?: string;
}

import { PartialType } from '@nestjs/swagger';
import { CreateWidgetDto } from './create-widget.dto';

// Смена status — отдельным эндпоинтом (PATCH /widgets/:id/status),
// чтобы не смешивать «правку контента» и «переход по жизненному циклу».
export class UpdateWidgetDto extends PartialType(CreateWidgetDto) {}

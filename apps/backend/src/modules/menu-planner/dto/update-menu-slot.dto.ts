// apps\backend\src\modules\menu-planner\dto\update-menu-slot.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateMenuSlotDto } from './create-menu-slot.dto';

export class UpdateMenuSlotDto extends PartialType(CreateMenuSlotDto) {}

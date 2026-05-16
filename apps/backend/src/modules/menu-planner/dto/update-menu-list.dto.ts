// apps\backend\src\modules\menu-planner\dto\update-menu-list.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateMenuListDto } from './create-menu-list.dto';

export class UpdateMenuListDto extends PartialType(CreateMenuListDto) {}

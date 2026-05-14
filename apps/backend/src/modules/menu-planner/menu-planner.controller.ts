import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MenuPlannerService } from './menu-planner.service';
import { CreateMenuListDto } from './dto/create-menu-list.dto';
import { UpdateMenuListDto } from './dto/update-menu-list.dto';
import { CreateMenuSlotDto } from './dto/create-menu-slot.dto';
import { UpdateMenuSlotDto } from './dto/update-menu-slot.dto';
import { AddRecipeToSlotDto } from './dto/add-recipe-to-slot.dto';
import { ReorderSlotItemsDto } from './dto/reorder-slot-items.dto';
import { UpdateSlotItemNotesDto } from './dto/update-slot-item-notes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MenuListResponseDto } from './dto/menu-list-response.dto';
import { MenuSlotResponseDto } from './dto/menu-slot-response.dto';
import { MenuSlotItemResponseDto } from './dto/menu-slot-item-response.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('menu-planner')
@Controller('menu-planner')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MenuPlannerController {
  constructor(private readonly menuPlannerService: MenuPlannerService) {}

  // ==================== MENU LISTS ====================

  @Post('lists')
  @ApiOperation({ summary: 'Создать новый список меню' })
  @ApiResponse({ status: HttpStatus.CREATED, type: MenuListResponseDto })
  async createMenuList(
    @Req() req: RequestWithUser,
    @Body() dto: CreateMenuListDto,
  ): Promise<MenuListResponseDto> {
    return this.menuPlannerService.createMenuList(req.user.id, dto);
  }

  @Get('lists')
  @ApiOperation({ summary: 'Получить все списки меню пользователя' })
  @ApiResponse({ status: HttpStatus.OK, type: [MenuListResponseDto] })
  async findAllMenuLists(
    @Req() req: RequestWithUser,
  ): Promise<MenuListResponseDto[]> {
    return this.menuPlannerService.findAllMenuLists(req.user.id);
  }

  @Get('lists/:id')
  @ApiOperation({ summary: 'Получить список меню по ID' })
  @ApiParam({ name: 'id', description: 'UUID списка меню' })
  @ApiResponse({ status: HttpStatus.OK, type: MenuListResponseDto })
  async findOneMenuList(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<MenuListResponseDto> {
    return this.menuPlannerService.findOneMenuListResponse(req.user.id, id);
  }

  @Patch('lists/:id')
  @ApiOperation({ summary: 'Обновить список меню' })
  @ApiParam({ name: 'id', description: 'UUID списка меню' })
  @ApiResponse({ status: HttpStatus.OK, type: MenuListResponseDto })
  async updateMenuList(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateMenuListDto,
  ): Promise<MenuListResponseDto> {
    return this.menuPlannerService.updateMenuList(req.user.id, id, dto);
  }

  @Delete('lists/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить список меню (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID списка меню' })
  async removeMenuList(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.menuPlannerService.removeMenuList(req.user.id, id);
  }

  // ==================== MENU SLOTS ====================

  @Post('slots')
  @ApiOperation({ summary: 'Создать слот меню' })
  @ApiResponse({ status: HttpStatus.CREATED, type: MenuSlotResponseDto })
  async createMenuSlot(
    @Req() req: RequestWithUser,
    @Body() dto: CreateMenuSlotDto,
  ): Promise<MenuSlotResponseDto> {
    return this.menuPlannerService.createMenuSlot(req.user.id, dto);
  }

  @Get('lists/:listId/slots')
  @ApiOperation({ summary: 'Получить все слоты списка меню' })
  @ApiParam({ name: 'listId', description: 'UUID списка меню' })
  @ApiResponse({ status: HttpStatus.OK, type: [MenuSlotResponseDto] })
  async findAllSlotsByMenuList(
    @Req() req: RequestWithUser,
    @Param('listId') listId: string,
  ): Promise<MenuSlotResponseDto[]> {
    return this.menuPlannerService.findAllSlotsByMenuList(req.user.id, listId);
  }

  @Get('slots/:id')
  @ApiOperation({ summary: 'Получить слот по ID' })
  @ApiParam({ name: 'id', description: 'UUID слота' })
  @ApiResponse({ status: HttpStatus.OK, type: MenuSlotResponseDto })
  async findOneMenuSlot(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<MenuSlotResponseDto> {
    return this.menuPlannerService.findOneMenuSlotResponse(req.user.id, id);
  }

  @Patch('slots/:id')
  @ApiOperation({ summary: 'Обновить слот' })
  @ApiParam({ name: 'id', description: 'UUID слота' })
  @ApiResponse({ status: HttpStatus.OK, type: MenuSlotResponseDto })
  async updateMenuSlot(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateMenuSlotDto,
  ): Promise<MenuSlotResponseDto> {
    return this.menuPlannerService.updateMenuSlot(req.user.id, id, dto);
  }

  @Delete('slots/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить слот' })
  @ApiParam({ name: 'id', description: 'UUID слота' })
  async removeMenuSlot(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.menuPlannerService.removeMenuSlot(req.user.id, id);
  }

  // ==================== SLOT ITEMS (RECIPES) ====================

  @Post('slots/:slotId/items')
  @ApiOperation({ summary: 'Добавить рецепт в слот' })
  @ApiParam({ name: 'slotId', description: 'UUID слота' })
  @ApiResponse({ status: HttpStatus.CREATED, type: MenuSlotItemResponseDto })
  async addRecipeToSlot(
    @Req() req: RequestWithUser,
    @Param('slotId') slotId: string,
    @Body() dto: AddRecipeToSlotDto,
  ): Promise<MenuSlotItemResponseDto> {
    return this.menuPlannerService.addRecipeToSlot(req.user.id, slotId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить рецепт из слота' })
  @ApiParam({ name: 'itemId', description: 'UUID элемента слота' })
  async removeRecipeFromSlot(
    @Req() req: RequestWithUser,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    await this.menuPlannerService.removeRecipeFromSlot(req.user.id, itemId);
  }

  @Post('slots/:slotId/items/reorder')
  @ApiOperation({ summary: 'Изменить порядок рецептов в слоте' })
  @ApiParam({ name: 'slotId', description: 'UUID слота' })
  @ApiResponse({ status: HttpStatus.OK, type: [MenuSlotItemResponseDto] })
  async reorderSlotItems(
    @Req() req: RequestWithUser,
    @Param('slotId') slotId: string,
    @Body() dto: ReorderSlotItemsDto,
  ): Promise<MenuSlotItemResponseDto[]> {
    return this.menuPlannerService.reorderSlotItems(req.user.id, slotId, dto);
  }

  @Patch('items/:itemId/notes')
  @ApiOperation({ summary: 'Обновить заметки рецепта в слоте' })
  @ApiParam({ name: 'itemId', description: 'UUID элемента слота' })
  @ApiResponse({ status: HttpStatus.OK, type: MenuSlotItemResponseDto })
  async updateSlotItemNotes(
    @Req() req: RequestWithUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateSlotItemNotesDto,
  ): Promise<MenuSlotItemResponseDto> {
    return this.menuPlannerService.updateSlotItemNotes(
      req.user.id,
      itemId,
      dto.notes,
    );
  }

  @Get('slots/:slotId/items')
  @ApiOperation({ summary: 'Получить все рецепты в слоте' })
  @ApiParam({ name: 'slotId', description: 'UUID слота' })
  @ApiResponse({ status: HttpStatus.OK, type: [MenuSlotItemResponseDto] })
  async getSlotItems(
    @Req() req: RequestWithUser,
    @Param('slotId') slotId: string,
  ): Promise<MenuSlotItemResponseDto[]> {
    return this.menuPlannerService.getSlotItems(req.user.id, slotId);
  }

  // ==================== UTILITY ====================

  @Get('lists/:listId/structure')
  @ApiOperation({
    summary: 'Получить полную структуру меню (список + слоты + рецепты)',
  })
  @ApiParam({ name: 'listId', description: 'UUID списка меню' })
  @ApiResponse({ status: HttpStatus.OK, type: MenuListResponseDto })
  async getMenuStructure(
    @Req() req: RequestWithUser,
    @Param('listId') listId: string,
  ): Promise<MenuListResponseDto> {
    return this.menuPlannerService.getMenuStructure(req.user.id, listId);
  }

  @Get('lists/:listId/slots/range')
  @ApiOperation({ summary: 'Получить слоты за период' })
  @ApiParam({ name: 'listId', description: 'UUID списка меню' })
  @ApiQuery({ name: 'startDate', description: 'Начальная дата (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'Конечная дата (YYYY-MM-DD)' })
  @ApiResponse({ status: HttpStatus.OK, type: [MenuSlotResponseDto] })
  async getSlotsByDateRange(
    @Req() req: RequestWithUser,
    @Param('listId') listId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<MenuSlotResponseDto[]> {
    return this.menuPlannerService.getSlotsByDateRange(
      req.user.id,
      listId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}

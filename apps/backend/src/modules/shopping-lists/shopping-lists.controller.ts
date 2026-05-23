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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ShoppingListsService } from './shopping-lists.service';
import { CreateShoppingListDto } from './dto/requests/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/requests/update-shopping-list.dto';
import { ReorderShoppingListsDto } from './dto/requests/reorder-shopping-lists.dto';
import { BulkCreateShoppingItemsDto, CreateShoppingItemDto } from './dto/requests/create-shopping-item.dto';
import { UpdateShoppingItemDto } from './dto/requests/update-shopping-item.dto';
import { ReorderShoppingItemsDto } from './dto/requests/reorder-shopping-items.dto';
import { ShareListResponseDto } from './dto/requests/share-list.dto';
import { ShoppingListResponseDto } from './dto/responses/shopping-list-response.dto';
import { ShoppingItemResponseDto } from './dto/responses/shopping-item-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CopyShoppingListDto } from './dto/requests/copy-shopping-list.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('shopping-lists')
@Controller('shopping-lists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShoppingListsController {
  constructor(private readonly shoppingListsService: ShoppingListsService) {}

  // ==================== SHOPPING LISTS ====================

  @Post()
  @ApiOperation({ summary: 'Создать новый список покупок' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ShoppingListResponseDto })
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateShoppingListDto,
  ): Promise<ShoppingListResponseDto> {
    return this.shoppingListsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все списки покупок пользователя' })
  @ApiResponse({ status: HttpStatus.OK, type: [ShoppingListResponseDto] })
  async findAll(@Req() req: RequestWithUser): Promise<ShoppingListResponseDto[]> {
    return this.shoppingListsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить список покупок по ID с позициями' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  @ApiResponse({ status: HttpStatus.OK, type: ShoppingListResponseDto })
  async findOne(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<ShoppingListResponseDto> {
    return this.shoppingListsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить список покупок' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  @ApiResponse({ status: HttpStatus.OK, type: ShoppingListResponseDto })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateShoppingListDto,
  ): Promise<ShoppingListResponseDto> {
    return this.shoppingListsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить список покупок (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  async remove(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.shoppingListsService.remove(req.user.id, id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Изменить порядок списков покупок' })
  @ApiResponse({ status: HttpStatus.OK, type: [ShoppingListResponseDto] })
  async reorder(
    @Req() req: RequestWithUser,
    @Body() dto: ReorderShoppingListsDto,
  ): Promise<ShoppingListResponseDto[]> {
    return this.shoppingListsService.reorder(req.user.id, dto.lists);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Сгенерировать share token для списка' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ShareListResponseDto })
  async generateShareToken(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<ShareListResponseDto> {
    const shareToken = await this.shoppingListsService.generateShareToken(
      req.user.id,
      id,
    );
    return { shareToken };
  }

  @Delete(':id/share')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Отозвать share token для списка' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  async revokeShareToken(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.shoppingListsService.revokeShareToken(req.user.id, id);
  }

  // ==================== SHOPPING LIST ITEMS ====================

  @Post(':id/items')
  @ApiOperation({ summary: 'Добавить позицию в список покупок' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ShoppingItemResponseDto })
  async addItem(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CreateShoppingItemDto,
  ): Promise<ShoppingItemResponseDto> {
    return this.shoppingListsService.addItem(req.user.id, id, dto);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Получить все позиции списка покупок' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  @ApiResponse({ status: HttpStatus.OK, type: [ShoppingItemResponseDto] })
  async getItems(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<ShoppingItemResponseDto[]> {
    return this.shoppingListsService.getItems(req.user.id, id);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Обновить позицию в списке покупок' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  @ApiParam({ name: 'itemId', description: 'UUID позиции' })
  @ApiResponse({ status: HttpStatus.OK, type: ShoppingItemResponseDto })
  async updateItem(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateShoppingItemDto,
  ): Promise<ShoppingItemResponseDto> {
    return this.shoppingListsService.updateItem(req.user.id, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить позицию из списка покупок (hard delete)' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  @ApiParam({ name: 'itemId', description: 'UUID позиции' })
  async removeItem(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ): Promise<void> {
    await this.shoppingListsService.removeItem(req.user.id, id, itemId);
  }

  @Patch(':id/items/:itemId/toggle')
  @ApiOperation({ summary: 'Переключить статус is_checked позиции' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  @ApiParam({ name: 'itemId', description: 'UUID позиции' })
  @ApiResponse({ status: HttpStatus.OK, type: ShoppingItemResponseDto })
  async toggleItem(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ): Promise<ShoppingItemResponseDto> {
    return this.shoppingListsService.toggleItem(req.user.id, id, itemId);
  }

  @Post(':id/items/uncheck-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Снять все отметки в списке покупок' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  async uncheckAll(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.shoppingListsService.uncheckAll(req.user.id, id);
  }

  @Patch(':id/items/reorder')
  @ApiOperation({ summary: 'Изменить порядок позиций в списке покупок' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  @ApiResponse({ status: HttpStatus.OK, type: [ShoppingItemResponseDto] })
  async reorderItems(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: ReorderShoppingItemsDto,
  ): Promise<ShoppingItemResponseDto[]> {
    return this.shoppingListsService.reorderItems(req.user.id, id, dto.items);
  }

  @Post(':id/items/bulk')
  @ApiOperation({ summary: 'Добавить несколько позиций в список' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок' })
  @ApiResponse({ status: HttpStatus.CREATED, type: [ShoppingItemResponseDto] })
  async addItemsBulk(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: BulkCreateShoppingItemsDto,
  ): Promise<ShoppingItemResponseDto[]> {
    return this.shoppingListsService.addItemsBulk(req.user.id, id, dto.items);
  }

  @Post(':id/copy')
  @ApiOperation({ summary: 'Создать копию списка покупок' })
  @ApiParam({ name: 'id', description: 'UUID списка покупок для копирования' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ShoppingListResponseDto })
  async copy(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CopyShoppingListDto,
  ): Promise<ShoppingListResponseDto> {
    return this.shoppingListsService.copy(req.user.id, id, dto);
  }
}

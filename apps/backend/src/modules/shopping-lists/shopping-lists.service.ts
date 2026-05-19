import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShoppingList } from './entities/shopping-list.entity';
import { ShoppingListItem } from './entities/shopping-list-item.entity';
import { CreateShoppingListDto } from './dto/requests/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/requests/update-shopping-list.dto';
import { CreateShoppingItemDto } from './dto/requests/create-shopping-item.dto';
import { UpdateShoppingItemDto } from './dto/requests/update-shopping-item.dto';
import { ShoppingListResponseDto } from './dto/responses/shopping-list-response.dto';
import { ShoppingItemResponseDto } from './dto/responses/shopping-item-response.dto';
import { ShoppingCategoriesService } from '../shopping-categories/shopping-categories.service';
import { CategoryResponseDto } from '../shopping-categories/dto/category-response.dto';
import crypto from 'crypto';

@Injectable()
export class ShoppingListsService {
  private readonly MAX_LISTS_PER_USER = 20;

  constructor(
    @InjectRepository(ShoppingList)
    private shoppingListRepository: Repository<ShoppingList>,
    @InjectRepository(ShoppingListItem)
    private shoppingListItemRepository: Repository<ShoppingListItem>,
    private shoppingCategoriesService: ShoppingCategoriesService,
    private dataSource: DataSource,
  ) {}

  // ==================== PRIVATE METHODS ====================

  private toCategoryResponseDto(category: any): CategoryResponseDto | null {
    if (!category) return null;
    return {
      id: category.id,
      code: category.code,
      name: category.name,
      icon: category.icon,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private toItemResponseDto(item: ShoppingListItem): ShoppingItemResponseDto {
    return {
      id: item.id,
      name: item.name,
      category: this.toCategoryResponseDto(item.category),
      quantity: Number(item.quantity),
      unit: item.unit,
      price: item.price ? Number(item.price) : null,
      isChecked: item.isChecked,
      sortOrder: item.sortOrder,
      note: item.note,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toListResponseDto(
    list: ShoppingList,
    includeItems: boolean = false,
  ): ShoppingListResponseDto {
    const response: ShoppingListResponseDto = {
      id: list.id,
      title: list.title,
      shareToken: list.shareToken,
      sortOrder: list.sortOrder,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    };

    if (includeItems && list.items) {
      response.items = list.items.map((item) => this.toItemResponseDto(item));
    }

    return response;
  }

  private async findOneList(
    userId: string,
    id: string,
    includeItems: boolean = false,
  ): Promise<ShoppingList> {
    const relations = includeItems ? ['items', 'items.category'] : [];

    const list = await this.shoppingListRepository.findOne({
      where: { id },
      relations,
    });

    if (!list) {
      throw new NotFoundException('Список покупок не найден');
    }

    if (list.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому списку');
    }

    return list;
  }

  private async findOneItem(itemId: string): Promise<ShoppingListItem> {
    const item = await this.shoppingListItemRepository.findOne({
      where: { id: itemId },
      relations: ['category'],
    });

    if (!item) {
      throw new NotFoundException('Позиция не найдена');
    }

    return item;
  }

  // ==================== SHOPPING LISTS ====================

  async create(
    userId: string,
    dto: CreateShoppingListDto,
  ): Promise<ShoppingListResponseDto> {
    // Проверка лимита
    const count = await this.shoppingListRepository.count({
      where: { userId },
    });

    if (count >= this.MAX_LISTS_PER_USER) {
      throw new BadRequestException(
        `Превышен максимальный лимит списков (${this.MAX_LISTS_PER_USER})`,
      );
    }

    // Получаем максимальный sort_order
    const maxOrderResult = await this.shoppingListRepository
      .createQueryBuilder('list')
      .select('MAX(list.sortOrder)', 'max')
      .where('list.userId = :userId', { userId })
      .getRawOne();

    const sortOrder =
      dto.sortOrder !== undefined
        ? dto.sortOrder
        : (maxOrderResult?.max || 0) + 1000;

    const list = this.shoppingListRepository.create({
      userId,
      title: dto.title,
      sortOrder,
    });

    const saved = await this.shoppingListRepository.save(list);
    return this.toListResponseDto(saved, false);
  }

  async findAll(userId: string): Promise<ShoppingListResponseDto[]> {
    const lists = await this.shoppingListRepository.find({
      where: { userId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    return lists.map((list) => this.toListResponseDto(list, false));
  }

  async findOne(
    userId: string,
    id: string,
  ): Promise<ShoppingListResponseDto> {
    const list = await this.findOneList(userId, id, true);
    return this.toListResponseDto(list, true);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateShoppingListDto,
  ): Promise<ShoppingListResponseDto> {
    const list = await this.findOneList(userId, id, false);
    Object.assign(list, dto);
    const saved = await this.shoppingListRepository.save(list);
    return this.toListResponseDto(saved, false);
  }

  async remove(userId: string, id: string): Promise<void> {
    const list = await this.findOneList(userId, id, false);
    // Soft delete
    await this.shoppingListRepository.softRemove(list);
  }

  async reorder(
    userId: string,
    items: { id: string; sortOrder: number }[],
  ): Promise<ShoppingListResponseDto[]> {
    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        const list = await manager.findOne(ShoppingList, {
          where: { id: item.id, userId },
        });
        if (!list) {
          throw new BadRequestException(
            `Список с ID "${item.id}" не найден или не принадлежит пользователю`,
          );
        }
        await manager.update(ShoppingList, item.id, { sortOrder: item.sortOrder });
      }
    });

    return this.findAll(userId);
  }

  async generateShareToken(userId: string, id: string): Promise<string> {
    const list = await this.findOneList(userId, id, false);

    if (list.shareToken) {
      return list.shareToken;
    }

    const shareToken = crypto.randomBytes(48).toString('hex');
    list.shareToken = shareToken;
    await this.shoppingListRepository.save(list);

    return shareToken;
  }

  async revokeShareToken(userId: string, id: string): Promise<void> {
    const list = await this.findOneList(userId, id, false);
    list.shareToken = null;
    await this.shoppingListRepository.save(list);
  }

  async findByShareToken(token: string): Promise<ShoppingListResponseDto> {
    const list = await this.shoppingListRepository.findOne({
      where: { shareToken: token },
      relations: ['items', 'items.category'],
    });

    if (!list) {
      throw new NotFoundException('Список не найден');
    }

    return this.toListResponseDto(list, true);
  }

  // ==================== SHOPPING LIST ITEMS ====================

  async addItem(
    userId: string,
    listId: string,
    dto: CreateShoppingItemDto,
  ): Promise<ShoppingItemResponseDto> {
    const list = await this.findOneList(userId, listId, false);

    // Валидация категории если указана
    if (dto.categoryId) {
      await this.shoppingCategoriesService.findOne(dto.categoryId);
    }

    // Получаем максимальный sort_order
    const maxOrderResult = await this.shoppingListItemRepository
      .createQueryBuilder('item')
      .select('MAX(item.sortOrder)', 'max')
      .where('item.shoppingListId = :listId', { listId })
      .getRawOne();

    const sortOrder = (maxOrderResult?.max || 0) + 1000;

    const item = this.shoppingListItemRepository.create({
      shoppingListId: listId,
      name: dto.name,
      categoryId: dto.categoryId || null,
      quantity: dto.quantity ?? 1,
      unit: dto.unit ?? 'шт',
      price: dto.price ?? null,
      note: dto.note ?? null,
      sortOrder,
    });

    const saved = await this.shoppingListItemRepository.save(item);

    // Подгружаем категорию для ответа
    const withCategory = await this.findOneItem(saved.id);
    return this.toItemResponseDto(withCategory);
  }

  async updateItem(
    userId: string,
    listId: string,
    itemId: string,
    dto: UpdateShoppingItemDto,
  ): Promise<ShoppingItemResponseDto> {
    // Проверяем доступ к списку
    await this.findOneList(userId, listId, false);

    const item = await this.findOneItem(itemId);

    if (item.shoppingListId !== listId) {
      throw new BadRequestException('Позиция не принадлежит этому списку');
    }

    // Валидация категории если указана
    if (dto.categoryId !== undefined) {
      if (dto.categoryId) {
        await this.shoppingCategoriesService.findOne(dto.categoryId);
      }
      item.categoryId = dto.categoryId;
    }

    if (dto.name !== undefined) item.name = dto.name;
    if (dto.quantity !== undefined) item.quantity = dto.quantity;
    if (dto.unit !== undefined) item.unit = dto.unit;
    if (dto.price !== undefined) item.price = dto.price;
    if (dto.isChecked !== undefined) item.isChecked = dto.isChecked;
    if (dto.note !== undefined) item.note = dto.note;

    const saved = await this.shoppingListItemRepository.save(item);

    // Подгружаем обновленные связи
    const withRelations = await this.findOneItem(saved.id);
    return this.toItemResponseDto(withRelations);
  }

  async removeItem(
    userId: string,
    listId: string,
    itemId: string,
  ): Promise<void> {
    // Проверяем доступ к списку
    await this.findOneList(userId, listId, false);

    const item = await this.findOneItem(itemId);

    if (item.shoppingListId !== listId) {
      throw new BadRequestException('Позиция не принадлежит этому списку');
    }

    // Hard delete
    await this.shoppingListItemRepository.remove(item);
  }

  async toggleItem(
    userId: string,
    listId: string,
    itemId: string,
  ): Promise<ShoppingItemResponseDto> {
    const item = await this.updateItem(userId, listId, itemId, {
      isChecked: undefined,
    });

    const updated = await this.updateItem(userId, listId, itemId, {
      isChecked: !item.isChecked,
    });

    return updated;
  }

  async uncheckAll(userId: string, listId: string): Promise<void> {
    await this.findOneList(userId, listId, false);

    await this.shoppingListItemRepository.update(
      { shoppingListId: listId },
      { isChecked: false },
    );
  }

  async reorderItems(
    userId: string,
    listId: string,
    items: { id: string; sortOrder: number }[],
  ): Promise<ShoppingItemResponseDto[]> {
    await this.findOneList(userId, listId, false);

    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        const existingItem = await manager.findOne(ShoppingListItem, {
          where: { id: item.id, shoppingListId: listId },
        });

        if (!existingItem) {
          throw new BadRequestException(
            `Позиция с ID "${item.id}" не найдена в этом списке`,
          );
        }

        await manager.update(ShoppingListItem, item.id, { sortOrder: item.sortOrder });
      }
    });

    const updatedItems = await this.shoppingListItemRepository.find({
      where: { shoppingListId: listId },
      relations: ['category'],
      order: { sortOrder: 'ASC' },
    });

    return updatedItems.map((item) => this.toItemResponseDto(item));
  }

  async getItems(
    userId: string,
    listId: string,
  ): Promise<ShoppingItemResponseDto[]> {
    await this.findOneList(userId, listId, false);

    const items = await this.shoppingListItemRepository.find({
      where: { shoppingListId: listId },
      relations: ['category'],
      order: { sortOrder: 'ASC' },
    });

    return items.map((item) => this.toItemResponseDto(item));
  }
}

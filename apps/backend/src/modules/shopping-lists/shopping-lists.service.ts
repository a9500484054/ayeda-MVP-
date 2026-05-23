import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
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
    stats?: { totalItems: number; checkedItems: number },
    includeItems: boolean = false,
  ): ShoppingListResponseDto {
    const response: ShoppingListResponseDto = {
      id: list.id,
      title: list.title,
      shareToken: list.shareToken,
      sortOrder: list.sortOrder,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
      totalItems: stats?.totalItems ?? 0,
      checkedItems: stats?.checkedItems ?? 0,
    };

    // Добавляем прогресс в процентах, если есть позиции
    if (response.totalItems > 0) {
      response.progress = (response.checkedItems / response.totalItems) * 100;
    }

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

    // Получаем максимальный sort_order для списка
    const maxOrderResult = await this.shoppingListRepository
      .createQueryBuilder('list')
      .select('MAX(list.sortOrder)', 'max')
      .where('list.userId = :userId', { userId })
      .getRawOne();

    const sortOrder =
      dto.sortOrder !== undefined
        ? dto.sortOrder
        : (maxOrderResult?.max || 0) + 1000;

    // Используем транзакцию для создания списка и позиций
    return await this.dataSource.transaction(async (manager) => {
      // 1. Создаем список
      const list = manager.create(ShoppingList, {
        userId,
        title: dto.title,
        sortOrder,
      });

      const savedList = await manager.save(list);

      // 2. Создаем позиции, если они есть
      let createdItems: ShoppingListItem[] = [];
      if (dto.items && dto.items.length > 0) {
        // Проверяем все категории заранее
        for (const item of dto.items) {
          if (item.categoryId) {
            const category = await this.shoppingCategoriesService.findOne(item.categoryId);
            if (!category) {
              throw new BadRequestException(`Категория с ID "${item.categoryId}" не найдена`);
            }
          }
        }

        // Получаем максимальный sort_order для позиций
        const maxItemOrderResult = await manager
          .createQueryBuilder(ShoppingListItem, 'item')
          .select('MAX(item.sortOrder)', 'max')
          .where('item.shoppingListId = :listId', { listId: savedList.id })
          .getRawOne();

        let currentSortOrder = (maxItemOrderResult?.max || 0) + 1000;

        // Создаем позиции
        const itemsToCreate = dto.items.map((itemDto) => {
          const item = manager.create(ShoppingListItem, {
            shoppingListId: savedList.id,
            name: itemDto.name,
            categoryId: itemDto.categoryId || null,
            quantity: itemDto.quantity ?? 1,
            unit: itemDto.unit ?? 'шт',
            price: itemDto.price ?? null,
            note: itemDto.note ?? null,
            sortOrder: currentSortOrder,
          });
          currentSortOrder += 1000;
          return item;
        });

        createdItems = await manager.save(itemsToCreate);
      }

      // 3. Загружаем созданные позиции с категориями для ответа
      if (createdItems.length > 0) {
        const itemsWithCategories = await manager.find(ShoppingListItem, {
          where: { shoppingListId: savedList.id },
          relations: ['category'],
          order: { sortOrder: 'ASC' },
        });
        savedList.items = itemsWithCategories;
      } else {
        savedList.items = [];
      }

      // 4. Получаем статистику для ответа
      const stats = await this.getListStats(manager, savedList.id);

      return this.toListResponseDto(savedList, stats, true);
    });
  }

  // Добавьте вспомогательный метод для получения статистики
  private async getListStats(
    manager: any,
    listId: string,
  ): Promise<{ totalItems: number; checkedItems: number }> {
    const result = await manager
      .createQueryBuilder(ShoppingListItem, 'item')
      .select('COUNT(item.id)', 'totalItems')
      .addSelect('SUM(CASE WHEN item.isChecked = true THEN 1 ELSE 0 END)', 'checkedItems')
      .where('item.shoppingListId = :listId', { listId })
      .getRawOne();

    return {
      totalItems: parseInt(result.totalItems) || 0,
      checkedItems: parseInt(result.checkedItems) || 0,
    };
  }
  async findAll(userId: string): Promise<ShoppingListResponseDto[]> {
    const query = this.shoppingListRepository
      .createQueryBuilder('list')
      .leftJoin('shopping_list_items', 'item', 'item.shopping_list_id = list.id')
      .select([
        'list.id',
        'list.title',
        'list.share_token',
        'list.sort_order',
        'list.created_at',
        'list.updated_at',
        'COUNT(item.id) as total_items',
        'SUM(CASE WHEN item.is_checked = true THEN 1 ELSE 0 END) as checked_items',
      ])
      .where('list.user_id = :userId', { userId })
      .andWhere('list.deleted_at IS NULL')
      .groupBy('list.id')
      .orderBy('list.sort_order', 'ASC')
      .addOrderBy('list.created_at', 'ASC');

    const results = await query.getRawMany();

    // Преобразуем результаты в DTO
    return results.map((row) => {
      const list = new ShoppingList();
      list.id = row.list_id;
      list.title = row.list_title;
      list.shareToken = row.list_share_token;
      list.sortOrder = parseInt(row.list_sort_order);
      list.createdAt = row.list_created_at;
      list.updatedAt = row.list_updated_at;

      return this.toListResponseDto(list, {
        totalItems: parseInt(row.total_items),
        checkedItems: parseInt(row.checked_items),
      });
    });
  }

  async findOne(
    userId: string,
    id: string,
  ): Promise<ShoppingListResponseDto> {
    // Получаем список со статистикой
    const query = this.shoppingListRepository
      .createQueryBuilder('list')
      .leftJoin('shopping_list_items', 'item', 'item.shopping_list_id = list.id')
      .select([
        'list.id',
        'list.title',
        'list.share_token',
        'list.sort_order',
        'list.created_at',
        'list.updated_at',
        'COUNT(item.id) as total_items',
        'SUM(CASE WHEN item.is_checked = true THEN 1 ELSE 0 END) as checked_items',
      ])
      .where('list.id = :id', { id })
      .andWhere('list.user_id = :userId', { userId })
      .andWhere('list.deleted_at IS NULL')
      .groupBy('list.id');

    const result = await query.getRawOne();

    if (!result) {
      throw new NotFoundException('Список покупок не найден');
    }

    // Загружаем items с категориями для детального просмотра
    const listWithItems = await this.shoppingListRepository.findOne({
      where: { id, userId },
      relations: ['items', 'items.category'],
    });

    const list = new ShoppingList();
    list.id = result.list_id;
    list.title = result.list_title;
    list.shareToken = result.list_share_token;
    list.sortOrder = parseInt(result.list_sort_order);
    list.createdAt = result.list_created_at;
    list.updatedAt = result.list_updated_at;
    list.items = listWithItems?.items || [];

    return this.toListResponseDto(list, {
      totalItems: parseInt(result.total_items),
      checkedItems: parseInt(result.checked_items),
    }, true);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateShoppingListDto,
  ): Promise<ShoppingListResponseDto> {
    const list = await this.findOneList(userId, id, false);
    Object.assign(list, dto);
    const saved = await this.shoppingListRepository.save(list);
    return this.toListResponseDto(saved);
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

    const shareToken = crypto.randomBytes(32).toString('hex');
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
    // Получаем список со статистикой
    const query = this.shoppingListRepository
      .createQueryBuilder('list')
      .leftJoin('shopping_list_items', 'item', 'item.shopping_list_id = list.id')
      .select([
        'list.id',
        'list.title',
        'list.share_token',
        'list.sort_order',
        'list.created_at',
        'list.updated_at',
        'COUNT(item.id) as total_items',
        'SUM(CASE WHEN item.is_checked = true THEN 1 ELSE 0 END) as checked_items',
      ])
      .where('list.share_token = :token', { token })
      .andWhere('list.deleted_at IS NULL')
      .groupBy('list.id');

    const result = await query.getRawOne();

    if (!result) {
      throw new NotFoundException('Список не найден');
    }

    // Загружаем items с категориями для детального просмотра
    const listWithItems = await this.shoppingListRepository.findOne({
      where: { shareToken: token },
      relations: ['items', 'items.category'],
    });

    const list = new ShoppingList();
    list.id = result.list_id;
    list.title = result.list_title;
    list.shareToken = result.list_share_token;
    list.sortOrder = parseInt(result.list_sort_order);
    list.createdAt = result.list_created_at;
    list.updatedAt = result.list_updated_at;
    list.items = listWithItems?.items || [];

    return this.toListResponseDto(list, {
      totalItems: parseInt(result.total_items),
      checkedItems: parseInt(result.checked_items),
    }, true);
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
    // Проверяем доступ к списку
    await this.findOneList(userId, listId, false);

    const item = await this.findOneItem(itemId);

    if (item.shoppingListId !== listId) {
      throw new BadRequestException('Позиция не принадлежит этому списку');
    }

    return this.updateItem(userId, listId, itemId, {
      isChecked: !item.isChecked,
    });
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
  async addItemsBulk(
    userId: string,
    listId: string,
    items: CreateShoppingItemDto[],
  ): Promise<ShoppingItemResponseDto[]> {
    // Проверяем доступ к списку
    await this.findOneList(userId, listId, false);

    if (!items || items.length === 0) {
      throw new BadRequestException('Нет позиций для добавления');
    }

    // Проверяем все категории заранее
    for (const item of items) {
      if (item.categoryId) {
        await this.shoppingCategoriesService.findOne(item.categoryId);
      }
    }

    // Получаем максимальный sort_order
    const maxOrderResult = await this.shoppingListItemRepository
      .createQueryBuilder('item')
      .select('MAX(item.sortOrder)', 'max')
      .where('item.shoppingListId = :listId', { listId })
      .getRawOne();

    let currentSortOrder = (maxOrderResult?.max || 0) + 1000;

    // Создаем все позиции
    const itemsToCreate = items.map((itemDto) => {
      return this.shoppingListItemRepository.create({
        shoppingListId: listId,
        name: itemDto.name,
        categoryId: itemDto.categoryId || null,
        quantity: itemDto.quantity ?? 1,
        unit: itemDto.unit ?? 'шт',
        price: itemDto.price ?? null,
        note: itemDto.note ?? null,
        sortOrder: currentSortOrder,
      });
      currentSortOrder += 1000;
    });

    const savedItems = await this.shoppingListItemRepository.save(itemsToCreate);

    // Загружаем с категориями для ответа
    const itemsWithCategories = await this.shoppingListItemRepository.find({
      where: { id: In(savedItems.map(i => i.id)) },
      relations: ['category'],
      order: { sortOrder: 'ASC' },
    });

    return itemsWithCategories.map((item) => this.toItemResponseDto(item));
  }
}

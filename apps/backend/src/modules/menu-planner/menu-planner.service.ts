import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, Between, IsNull } from 'typeorm';
import { MenuList } from './entities/menu-list.entity';
import { MenuSlot } from './entities/menu-slot.entity';
import { MenuSlotItem } from './entities/menu-slot-item.entity';
import { CreateMenuListDto } from './dto/create-menu-list.dto';
import { UpdateMenuListDto } from './dto/update-menu-list.dto';
import { CreateMenuSlotDto } from './dto/create-menu-slot.dto';
import { UpdateMenuSlotDto } from './dto/update-menu-slot.dto';
import { AddRecipeToSlotDto } from './dto/add-recipe-to-slot.dto';
import { ReorderSlotItemsDto } from './dto/reorder-slot-items.dto';
import { RecipesService } from '../recipes/recipes.service';
import { MenuListResponseDto } from './dto/menu-list-response.dto';
import { MenuSlotResponseDto } from './dto/menu-slot-response.dto';
import { MenuSlotItemResponseDto } from './dto/menu-slot-item-response.dto';
import { DisplayType } from './enums/display-type.enum';

@Injectable()
export class MenuPlannerService {
  constructor(
    @InjectRepository(MenuList)
    private menuListRepository: Repository<MenuList>,
    @InjectRepository(MenuSlot)
    private menuSlotRepository: Repository<MenuSlot>,
    @InjectRepository(MenuSlotItem)
    private menuSlotItemRepository: Repository<MenuSlotItem>,
    private recipesService: RecipesService,
    private dataSource: DataSource,
  ) {}

  private readonly slotRelations = [
    'items',
    'items.recipe',
    'items.recipe.author',
    'items.recipe.ingredients',
    'items.recipe.ingredients.ingredient',
    'items.recipe.ingredients.unit',
    'items.recipe.categories',
    'items.recipe.categories.category',
  ];

  private readonly itemRelations = [
    'recipe',
    'recipe.author',
    'recipe.ingredients',
    'recipe.ingredients.ingredient',
    'recipe.ingredients.unit',
    'recipe.categories',
    'recipe.categories.category',
  ];

  private toDateString(date: Date | string | null): string | null {
    if (!date) {
      return null;
    }

    return date instanceof Date ? date.toISOString().split('T')[0] : date;
  }

  private toMenuSlotItemResponseDto(
    item: MenuSlotItem,
  ): MenuSlotItemResponseDto {
    return {
      id: item.id,
      slotId: item.slotId,
      recipeId: item.recipeId,
      order: item.order,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      recipe: item.recipe
        ? this.recipesService.toResponseDto(item.recipe)
        : undefined,
    };
  }

  private toMenuSlotResponseDto(slot: MenuSlot): MenuSlotResponseDto {
    return {
      id: slot.id,
      menuListId: slot.menuListId,
      slotDate: this.toDateString(slot.slotDate),
      mealType: slot.mealType,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
      items: slot.items?.map((item) => this.toMenuSlotItemResponseDto(item)),
    };
  }

  private toMenuListResponseDto(menuList: MenuList): MenuListResponseDto {
    return {
      id: menuList.id,
      userId: menuList.userId,
      title: menuList.title,
      description: menuList.description,
      icon: menuList.icon,
      isActive: menuList.isActive,
      createdAt: menuList.createdAt,
      updatedAt: menuList.updatedAt,
      deletedAt: menuList.deletedAt,
      slots: menuList.slots?.map((slot) => this.toMenuSlotResponseDto(slot)),
      displayType: menuList.displayType,
    };
  }

  // ==================== MENU LISTS ====================

  async createMenuList(
    userId: string,
    dto: CreateMenuListDto,
  ): Promise<MenuListResponseDto> {
    const menuList = this.menuListRepository.create({
      userId,
      title: dto.title,
      description: dto.description,
      icon: dto.icon,
      isActive: dto.isActive ?? true,
      displayType: dto.displayType ?? DisplayType.DAYS,  // ← добавить
    });

    return this.toMenuListResponseDto(
      await this.menuListRepository.save(menuList),
    );
  }

  async findAllMenuLists(userId: string): Promise<MenuListResponseDto[]> {
    const menuLists = await this.menuListRepository.find({
      where: { userId, deletedAt: IsNull() },
      relations: [
        'slots',
        ...this.slotRelations.map((relation) => `slots.${relation}`),
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    return menuLists.map((menuList) => this.toMenuListResponseDto(menuList));
  }

  async findOneMenuList(userId: string, id: string): Promise<MenuList> {
    const menuList = await this.menuListRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: [
        'slots',
        ...this.slotRelations.map((relation) => `slots.${relation}`),
      ],
    });

    if (!menuList) {
      throw new NotFoundException('Список меню не найден');
    }

    if (menuList.userId !== userId) {
      throw new ForbiddenException('У вас нет доступа к этому списку меню');
    }

    return menuList;
  }

  async findOneMenuListResponse(
    userId: string,
    id: string,
  ): Promise<MenuListResponseDto> {
    return this.toMenuListResponseDto(await this.findOneMenuList(userId, id));
  }

  async updateMenuList(
    userId: string,
    id: string,
    dto: UpdateMenuListDto,
  ): Promise<MenuListResponseDto> {
    const menuList = await this.findOneMenuList(userId, id);

    Object.assign(menuList, dto);
    return this.toMenuListResponseDto(
      await this.menuListRepository.save(menuList),
    );
  }

  async removeMenuList(userId: string, id: string): Promise<void> {
    await this.findOneMenuList(userId, id);
    await this.menuListRepository.softDelete(id);
  }

  // ==================== MENU SLOTS ====================

  async createMenuSlot(
    userId: string,
    dto: CreateMenuSlotDto,
  ): Promise<MenuSlotResponseDto> {
    // Проверяем, что список меню принадлежит пользователю
    await this.findOneMenuList(userId, dto.menuListId);

    // Проверяем уникальность слота (если есть дата)
    if (dto.slotDate) {
      const existingSlot = await this.menuSlotRepository.findOne({
        where: {
          menuListId: dto.menuListId,
          slotDate: new Date(dto.slotDate),
          mealType: dto.mealType,
        },
      });

      if (existingSlot) {
        throw new BadRequestException(
          `Слот на дату ${dto.slotDate} и прием пищи ${dto.mealType} уже существует`,
        );
      }
    }

    const slot = this.menuSlotRepository.create({
      menuListId: dto.menuListId,
      slotDate: dto.slotDate ? new Date(dto.slotDate) : null,
      mealType: dto.mealType,
    });

    return this.toMenuSlotResponseDto(await this.menuSlotRepository.save(slot));
  }

  async findAllSlotsByMenuList(
    userId: string,
    menuListId: string,
  ): Promise<MenuSlotResponseDto[]> {
    await this.findOneMenuList(userId, menuListId);

    const slots = await this.menuSlotRepository.find({
      where: { menuListId },
      relations: this.slotRelations,
      order: {
        slotDate: 'ASC',
        mealType: 'ASC',
      },
    });

    return slots.map((slot) => this.toMenuSlotResponseDto(slot));
  }

  async findOneMenuSlot(userId: string, id: string): Promise<MenuSlot> {
    const slot = await this.menuSlotRepository.findOne({
      where: { id },
      relations: ['menuList', ...this.slotRelations],
    });

    if (!slot) {
      throw new NotFoundException('Слот меню не найден');
    }

    // Проверяем, что слот принадлежит пользователю через menuList
    await this.findOneMenuList(userId, slot.menuListId);

    return slot;
  }

  async findOneMenuSlotResponse(
    userId: string,
    id: string,
  ): Promise<MenuSlotResponseDto> {
    return this.toMenuSlotResponseDto(await this.findOneMenuSlot(userId, id));
  }

  async updateMenuSlot(
    userId: string,
    id: string,
    dto: UpdateMenuSlotDto,
  ): Promise<MenuSlotResponseDto> {
    const slot = await this.findOneMenuSlot(userId, id);

    // Если меняется дата или тип приема пищи - проверяем уникальность
    if (
      (dto.slotDate &&
        dto.slotDate !== slot.slotDate?.toISOString().split('T')[0]) ||
      (dto.mealType && dto.mealType !== slot.mealType)
    ) {
      const newDate = dto.slotDate ? new Date(dto.slotDate) : slot.slotDate;
      const newMealType = dto.mealType || slot.mealType;

      if (newDate) {
        const existingSlot = await this.menuSlotRepository.findOne({
          where: {
            menuListId: slot.menuListId,
            slotDate: newDate,
            mealType: newMealType,
            id: Not(id),
          },
        });

        if (existingSlot) {
          throw new BadRequestException(
            `Слот на дату ${newDate.toISOString().split('T')[0]} и прием пищи ${newMealType} уже существует`,
          );
        }
      }
    }

    if (dto.slotDate) {
      slot.slotDate = new Date(dto.slotDate);
    }
    if (dto.mealType) {
      slot.mealType = dto.mealType;
    }

    return this.toMenuSlotResponseDto(await this.menuSlotRepository.save(slot));
  }

  async removeMenuSlot(userId: string, id: string): Promise<void> {
    await this.findOneMenuSlot(userId, id);
    await this.menuSlotRepository.delete(id);
  }

  // ==================== SLOT ITEMS (RECIPES) ====================

  async addRecipeToSlot(
    userId: string,
    slotId: string,
    dto: AddRecipeToSlotDto,
  ): Promise<MenuSlotItemResponseDto> {
    // Проверяем существование слота и права доступа
    await this.findOneMenuSlot(userId, slotId);

    // Проверяем существование рецепта
    await this.recipesService.findOne(dto.recipeId);

    // Проверяем, не добавлен ли уже этот рецепт в слот
    const existingItem = await this.menuSlotItemRepository.findOne({
      where: {
        slotId,
        recipeId: dto.recipeId,
      },
    });

    if (existingItem) {
      throw new BadRequestException('Этот рецепт уже добавлен в данный слот');
    }

    // Получаем максимальный order для этого слота
    const maxOrder = await this.menuSlotItemRepository
      .createQueryBuilder('item')
      .select('MAX(item.order)', 'max')
      .where('item.slotId = :slotId', { slotId })
      .getRawOne();

    const order =
      dto.order !== undefined ? dto.order : Number(maxOrder?.max ?? -1) + 1;

    const slotItem = this.menuSlotItemRepository.create({
      slotId,
      recipeId: dto.recipeId,
      order,
      notes: dto.notes,
    });

    const savedSlotItem = await this.menuSlotItemRepository.save(slotItem);
    const slotItemWithRecipe = await this.menuSlotItemRepository.findOneOrFail({
      where: { id: savedSlotItem.id },
      relations: this.itemRelations,
    });

    return this.toMenuSlotItemResponseDto(slotItemWithRecipe);
  }

  async removeRecipeFromSlot(
    userId: string,
    slotItemId: string,
  ): Promise<void> {
    const slotItem = await this.menuSlotItemRepository.findOne({
      where: { id: slotItemId },
      relations: ['slot', 'slot.menuList'],
    });

    if (!slotItem) {
      throw new NotFoundException('Элемент слота не найден');
    }

    // Проверяем права доступа
    await this.findOneMenuList(userId, slotItem.slot.menuListId);

    await this.menuSlotItemRepository.delete(slotItemId);
  }

  async reorderSlotItems(
    userId: string,
    slotId: string,
    dto: ReorderSlotItemsDto,
  ): Promise<MenuSlotItemResponseDto[]> {
    // Проверяем слот и права
    await this.findOneMenuSlot(userId, slotId);

    // Обновляем порядок в транзакции
    await this.dataSource.transaction(async (manager) => {
      for (const item of dto.items) {
        await manager.update(MenuSlotItem, item.id, { order: item.order });
      }
    });

    // Возвращаем обновленный список
    const items = await this.menuSlotItemRepository.find({
      where: { slotId },
      relations: this.itemRelations,
      order: { order: 'ASC' },
    });

    return items.map((item) => this.toMenuSlotItemResponseDto(item));
  }

  async updateSlotItemNotes(
    userId: string,
    slotItemId: string,
    notes: string,
  ): Promise<MenuSlotItemResponseDto> {
    const slotItem = await this.menuSlotItemRepository.findOne({
      where: { id: slotItemId },
      relations: ['slot', 'slot.menuList'],
    });

    if (!slotItem) {
      throw new NotFoundException('Элемент слота не найден');
    }

    // Проверяем права доступа
    await this.findOneMenuList(userId, slotItem.slot.menuListId);

    slotItem.notes = notes;
    await this.menuSlotItemRepository.save(slotItem);

    const slotItemWithRecipe = await this.menuSlotItemRepository.findOneOrFail({
      where: { id: slotItemId },
      relations: this.itemRelations,
    });

    return this.toMenuSlotItemResponseDto(slotItemWithRecipe);
  }

  async getSlotItems(
    userId: string,
    slotId: string,
  ): Promise<MenuSlotItemResponseDto[]> {
    await this.findOneMenuSlot(userId, slotId);

    const items = await this.menuSlotItemRepository.find({
      where: { slotId },
      relations: this.itemRelations,
      order: { order: 'ASC' },
    });

    return items.map((item) => this.toMenuSlotItemResponseDto(item));
  }

  // ==================== UTILITY METHODS ====================

  async getMenuStructure(
    userId: string,
    menuListId: string,
  ): Promise<MenuListResponseDto> {
    return this.toMenuListResponseDto(
      await this.findOneMenuList(userId, menuListId),
    );
  }

  async getSlotsByDateRange(
    userId: string,
    menuListId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MenuSlotResponseDto[]> {
    await this.findOneMenuList(userId, menuListId);

    const slots = await this.menuSlotRepository.find({
      where: {
        menuListId,
        slotDate: Between(startDate, endDate),
      },
      relations: this.slotRelations,
      order: {
        slotDate: 'ASC',
        mealType: 'ASC',
      },
    });

    return slots.map((slot) => this.toMenuSlotResponseDto(slot));
  }
}

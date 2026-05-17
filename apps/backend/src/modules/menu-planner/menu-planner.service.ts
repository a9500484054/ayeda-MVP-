import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { MenuList } from './entities/menu-list.entity';
import { MenuDay } from './entities/menu-day.entity';
import { MenuSlot } from './entities/menu-slot.entity';
import { MenuSlotItem } from './entities/menu-slot-item.entity';
import { CreateMenuListDto } from './dto/create-menu-list.dto';
import { UpdateMenuListDto } from './dto/update-menu-list.dto';
import { CreateMenuSlotDto } from './dto/create-menu-slot.dto';
import { AddRecipeToSlotDto } from './dto/add-recipe-to-slot.dto';
import { ReorderSlotItemsDto } from './dto/reorder-slot-items.dto';
import { CreateDayDto, UpdateDayDto, ReorderDaysDto } from './dto/create-day.dto';
import { RecipesService } from '../recipes/recipes.service';
import { MenuListResponseDto } from './dto/menu-list-response.dto';
import { MenuSlotResponseDto } from './dto/menu-slot-response.dto';
import { MenuSlotItemResponseDto } from './dto/menu-slot-item-response.dto';
import { MenuDayResponseDto } from './dto/menu-day-response.dto';
import { DisplayType } from './enums/display-type.enum';
import { SlotType } from './enums/slot-type.enum';
import { MealType } from './enums/meal-type.enum';

@Injectable()
export class MenuPlannerService {
  constructor(
    @InjectRepository(MenuList)
    private menuListRepository: Repository<MenuList>,
    @InjectRepository(MenuDay)
    private menuDayRepository: Repository<MenuDay>,
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

  private readonly dayRelations = ['slots', 'slots.items', 'slots.items.recipe'];

  private toDateString(date: Date | string | null): string | null {
    if (!date) return null;
    return date instanceof Date ? date.toISOString().split('T')[0] : date;
  }

  private toMenuSlotItemResponseDto(item: MenuSlotItem): MenuSlotItemResponseDto {
    return {
      id: item.id,
      slotId: item.slotId,
      recipeId: item.recipeId,
      order: item.order,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      recipe: item.recipe ? this.recipesService.toResponseDto(item.recipe) : undefined,
    };
  }

  private toMenuSlotResponseDto(slot: MenuSlot): MenuSlotResponseDto {
    return {
      id: slot.id,
      menuListId: slot.menuListId,
      slotType: slot.slotType,
      dayId: slot.dayId,
      slotDate: this.toDateString(slot.slotDate),
      mealType: slot.mealType ?? undefined,
      order: slot.order,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
      items: slot.items?.map((item) => this.toMenuSlotItemResponseDto(item)),
    };
  }

  private toMenuDayResponseDto(day: MenuDay): MenuDayResponseDto {
    return {
      id: day.id,
      menuListId: day.menuListId,
      dayOrder: day.dayOrder,
      title: day.title,
      createdAt: day.createdAt,
      updatedAt: day.updatedAt,
      slots: day.slots?.map((slot) => this.toMenuSlotResponseDto(slot)),
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
      // deletedAt: undefined, // Больше не используем
      slots: menuList.slots?.map((slot) => this.toMenuSlotResponseDto(slot)),
      days: menuList.days?.map((day) => this.toMenuDayResponseDto(day)),
      displayType: menuList.displayType,
    };
  }

  // ==================== MENU LISTS ====================

  async createMenuList(userId: string, dto: CreateMenuListDto): Promise<MenuListResponseDto> {
    const menuList = this.menuListRepository.create({
      userId,
      title: dto.title,
      description: dto.description,
      icon: dto.icon,
      isActive: dto.isActive ?? true,
      displayType: dto.displayType ?? DisplayType.DAYS,
    });

    const saved = await this.menuListRepository.save(menuList);
    return this.toMenuListResponseDto(saved);
  }

  async findAllMenuLists(userId: string): Promise<MenuListResponseDto[]> {
    const menuLists = await this.menuListRepository.find({
      where: { userId }, // Убрали deletedAt: IsNull()
      relations: ['slots', 'days', ...this.slotRelations.map((r) => `slots.${r}`)],
      order: { createdAt: 'DESC' },
    });

    return menuLists.map((list) => this.toMenuListResponseDto(list));
  }

  async findOneMenuList(userId: string, id: string): Promise<MenuList> {
    const menuList = await this.menuListRepository.findOne({
      where: { id }, // Убрали deletedAt: IsNull()
      relations: ['slots', 'days', 'days.slots', ...this.slotRelations.map((r) => `slots.${r}`)],
    });

    if (!menuList) throw new NotFoundException('Список меню не найден');
    if (menuList.userId !== userId) throw new ForbiddenException('Нет доступа');

    return menuList;
  }

  async findOneMenuListResponse(userId: string, id: string): Promise<MenuListResponseDto> {
    return this.toMenuListResponseDto(await this.findOneMenuList(userId, id));
  }

  async updateMenuList(
    userId: string,
    id: string,
    dto: UpdateMenuListDto,
  ): Promise<MenuListResponseDto> {
    const menuList = await this.findOneMenuList(userId, id);
    Object.assign(menuList, dto);
    return this.toMenuListResponseDto(await this.menuListRepository.save(menuList));
  }

  async removeMenuList(userId: string, id: string): Promise<void> {
    const menuList = await this.findOneMenuList(userId, id);
    // Физическое удаление (каскадно удалит все связанные данные из-за CASCADE)
    await this.menuListRepository.remove(menuList);
  }

  // ==================== DAYS ====================

  async findAllDays(userId: string, menuListId: string): Promise<MenuDayResponseDto[]> {
    await this.findOneMenuList(userId, menuListId);
    const days = await this.menuDayRepository.find({
      where: { menuListId },
      relations: this.dayRelations,
      order: { dayOrder: 'ASC' },
    });
    return days.map((day) => this.toMenuDayResponseDto(day));
  }

  async createDay(userId: string, menuListId: string, dto: CreateDayDto): Promise<MenuDayResponseDto> {
    const menuList = await this.findOneMenuList(userId, menuListId);

    if (menuList.displayType !== DisplayType.DAYS) {
      throw new BadRequestException('Дни можно создавать только в режиме DAYS');
    }

    const existingDay = await this.menuDayRepository.findOne({
      where: { menuListId, dayOrder: dto.dayOrder },
    });

    if (existingDay) {
      throw new BadRequestException(`День с порядком ${dto.dayOrder} уже существует`);
    }

    const day = this.menuDayRepository.create({
      menuListId,
      dayOrder: dto.dayOrder,
      title: dto.title,
    });

    const saved = await this.menuDayRepository.save(day);
    return this.toMenuDayResponseDto(saved);
  }

  async updateDay(userId: string, dayId: string, dto: UpdateDayDto): Promise<MenuDayResponseDto> {
    const day = await this.menuDayRepository.findOne({
      where: { id: dayId },
      relations: ['menuList'],
    });

    if (!day) throw new NotFoundException('День не найден');
    await this.findOneMenuList(userId, day.menuListId);

    if (dto.title !== undefined) day.title = dto.title;

    const saved = await this.menuDayRepository.save(day);
    return this.toMenuDayResponseDto(saved);
  }

  async reorderDays(userId: string, menuListId: string, dto: ReorderDaysDto): Promise<MenuDayResponseDto[]> {
    await this.findOneMenuList(userId, menuListId);

    await this.dataSource.transaction(async (manager) => {
      for (const item of dto.items) {
        await manager.update(MenuDay, item.id, { dayOrder: item.order });
      }
    });

    const days = await this.menuDayRepository.find({
      where: { menuListId },
      relations: this.dayRelations,
      order: { dayOrder: 'ASC' },
    });

    return days.map((day) => this.toMenuDayResponseDto(day));
  }

  async deleteDay(userId: string, dayId: string): Promise<void> {
    const day = await this.menuDayRepository.findOne({
      where: { id: dayId },
      relations: ['menuList'],
    });

    if (!day) {
      throw new NotFoundException('День не найден');
    }

    await this.findOneMenuList(userId, day.menuListId);

    // Физическое удаление (каскадно удалит слоты и их items из-за CASCADE)
    await this.menuDayRepository.remove(day);
  }

  // ==================== SLOTS ====================

  async createSlot(userId: string, dto: CreateMenuSlotDto): Promise<MenuSlotResponseDto> {
    await this.findOneMenuList(userId, dto.menuListId);

    const slot = this.menuSlotRepository.create({
      menuListId: dto.menuListId,
      slotType: dto.slotType,
      dayId: dto.dayId,
      slotDate: dto.slotDate ? new Date(dto.slotDate) : null,
      mealType: dto.mealType,
      order: dto.order ?? 0,
    });

    const saved = await this.menuSlotRepository.save(slot);
    return this.toMenuSlotResponseDto(saved);
  }

  async findAllSlotsByMenuList(userId: string, menuListId: string): Promise<MenuSlotResponseDto[]> {
    await this.findOneMenuList(userId, menuListId);
    const slots = await this.menuSlotRepository.find({
      where: { menuListId }, // Убрали deletedAt: IsNull()
      relations: this.slotRelations,
      order: { createdAt: 'ASC' },
    });
    return slots.map((slot) => this.toMenuSlotResponseDto(slot));
  }

  async findOneSlot(userId: string, slotId: string): Promise<MenuSlot> {
    const slot = await this.menuSlotRepository.findOne({
      where: { id: slotId }, // Убрали deletedAt: IsNull()
      relations: ['menuList', ...this.slotRelations],
    });

    if (!slot) throw new NotFoundException('Слот не найден');
    await this.findOneMenuList(userId, slot.menuListId);

    return slot;
  }

  async findOneSlotResponse(userId: string, slotId: string): Promise<MenuSlotResponseDto> {
    return this.toMenuSlotResponseDto(await this.findOneSlot(userId, slotId));
  }

  async deleteSlot(userId: string, slotId: string): Promise<void> {
    const slot = await this.findOneSlot(userId, slotId);
    // Физическое удаление (каскадно удалит все items из-за CASCADE)
    await this.menuSlotRepository.remove(slot);
  }

  // ==================== SLOT ITEMS (RECIPES) ====================

  async addRecipeToSlot(
    userId: string,
    slotId: string,
    dto: AddRecipeToSlotDto,
  ): Promise<MenuSlotItemResponseDto> {
    const slot = await this.findOneSlot(userId, slotId);

    await this.recipesService.findOne(dto.recipeId);

    // Проверяем существование активной записи (без soft delete теперь просто проверяем наличие)
    const existingItem = await this.menuSlotItemRepository.findOne({
      where: { slotId, recipeId: dto.recipeId },
    });

    if (existingItem) {
      throw new BadRequestException('Этот рецепт уже добавлен в данный слот');
    }

    const maxOrder = await this.menuSlotItemRepository
      .createQueryBuilder('item')
      .select('MAX(item.order)', 'max')
      .where('item.slotId = :slotId', { slotId })
      .getRawOne();

    const order = dto.order !== undefined ? dto.order : Number(maxOrder?.max ?? -1) + 1;

    const slotItem = this.menuSlotItemRepository.create({
      slotId,
      recipeId: dto.recipeId,
      order,
      notes: dto.notes,
    });

    const saved = await this.menuSlotItemRepository.save(slotItem);
    const withRelations = await this.menuSlotItemRepository.findOneOrFail({
      where: { id: saved.id },
      relations: this.itemRelations,
    });

    return this.toMenuSlotItemResponseDto(withRelations);
  }

  async removeRecipeFromSlot(userId: string, itemId: string): Promise<void> {
    const item = await this.menuSlotItemRepository.findOne({
      where: { id: itemId },
      relations: ['slot', 'slot.menuList'],
    });

    if (!item) throw new NotFoundException('Элемент не найден');
    await this.findOneMenuList(userId, item.slot.menuListId);

    // Физическое удаление
    await this.menuSlotItemRepository.remove(item);
  }

  async reorderSlotItems(
    userId: string,
    slotId: string,
    dto: ReorderSlotItemsDto,
  ): Promise<MenuSlotItemResponseDto[]> {
    await this.findOneSlot(userId, slotId);

    await this.dataSource.transaction(async (manager) => {
      for (const item of dto.items) {
        await manager.update(MenuSlotItem, item.id, { order: item.order });
      }
    });

    const items = await this.menuSlotItemRepository.find({
      where: { slotId },
      relations: this.itemRelations,
      order: { order: 'ASC' },
    });

    return items.map((item) => this.toMenuSlotItemResponseDto(item));
  }

  async updateSlotItemNotes(
    userId: string,
    itemId: string,
    notes: string,
  ): Promise<MenuSlotItemResponseDto> {
    const item = await this.menuSlotItemRepository.findOne({
      where: { id: itemId },
      relations: ['slot', 'slot.menuList', ...this.itemRelations],
    });

    if (!item) throw new NotFoundException('Элемент не найден');
    await this.findOneMenuList(userId, item.slot.menuListId);

    item.notes = notes;
    const saved = await this.menuSlotItemRepository.save(item);

    return this.toMenuSlotItemResponseDto(saved);
  }

  async getSlotItems(userId: string, slotId: string): Promise<MenuSlotItemResponseDto[]> {
    await this.findOneSlot(userId, slotId);
    const items = await this.menuSlotItemRepository.find({
      where: { slotId },
      relations: this.itemRelations,
      order: { order: 'ASC' },
    });
    return items.map((item) => this.toMenuSlotItemResponseDto(item));
  }

  // ==================== UTILITY ====================

  async getMenuStructure(userId: string, menuListId: string): Promise<MenuListResponseDto> {
    return this.toMenuListResponseDto(await this.findOneMenuList(userId, menuListId));
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
        slotType: SlotType.CALENDAR,
        slotDate: Between(startDate, endDate),
      },
      relations: this.slotRelations,
      order: { slotDate: 'ASC', mealType: 'ASC' },
    });

    return slots.map((slot) => this.toMenuSlotResponseDto(slot));
  }

  // ==================== BANQUET ====================

  async getBanquetItems(userId: string, menuListId: string): Promise<MenuSlotItemResponseDto[]> {
    const menuList = await this.findOneMenuList(userId, menuListId);

    if (menuList.displayType !== DisplayType.BANQUET) {
      throw new BadRequestException('Этот список не является банкетом');
    }

    const slots = await this.menuSlotRepository.find({
      where: {
        menuListId,
        slotType: SlotType.BANQUET,
      },
      relations: this.slotRelations,
      order: { order: 'ASC' },
    });

    const allItems: MenuSlotItem[] = [];
    for (const slot of slots) {
      if (slot.items) allItems.push(...slot.items);
    }

    return allItems.map((item) => this.toMenuSlotItemResponseDto(item));
  }

  async addBanquetItem(
    userId: string,
    menuListId: string,
    dto: AddRecipeToSlotDto,
  ): Promise<MenuSlotItemResponseDto> {
    const menuList = await this.findOneMenuList(userId, menuListId);

    if (menuList.displayType !== DisplayType.BANQUET) {
      throw new BadRequestException('Добавление блюд доступно только для банкета');
    }

    let banquetSlot = await this.menuSlotRepository.findOne({
      where: {
        menuListId,
        slotType: SlotType.BANQUET,
      },
    });

    if (!banquetSlot) {
      banquetSlot = await this.menuSlotRepository.save(
        this.menuSlotRepository.create({
          menuListId,
          slotType: SlotType.BANQUET,
          order: 0,
        }),
      );
    }

    return this.addRecipeToSlot(userId, banquetSlot.id, dto);
  }

  async createDayWithAutoOrder(userId: string, menuListId: string, title?: string): Promise<MenuDayResponseDto> {
    const menuList = await this.findOneMenuList(userId, menuListId);

    if (menuList.displayType !== DisplayType.DAYS) {
      throw new BadRequestException('Дни можно создавать только в режиме DAYS');
    }

    const maxOrderResult = await this.menuDayRepository
      .createQueryBuilder('day')
      .select('MAX(day.dayOrder)', 'max')
      .where('day.menuListId = :menuListId', { menuListId })
      .getRawOne();

    const nextOrder = (maxOrderResult?.max || 0) + 1;

    const day = this.menuDayRepository.create({
      menuListId,
      dayOrder: nextOrder,
      title: title || `День ${nextOrder}`,
    });

    const saved = await this.menuDayRepository.save(day);
    return this.toMenuDayResponseDto(saved);
  }
}

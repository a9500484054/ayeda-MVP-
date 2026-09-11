import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MenuPlannerService } from './menu-planner.service';
import { MenuDay } from './entities/menu-day.entity';
import { MenuSlotItem } from './entities/menu-slot-item.entity';
import { DisplayType } from './enums/display-type.enum';
import { SlotType } from './enums/slot-type.enum';
import { UserRole } from '../users/entities/user.entity';

function buildMenuList(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'list-1',
    userId: 'user-1',
    title: 'Мой список',
    description: null,
    icon: null,
    isActive: true,
    displayType: DisplayType.DAYS,
    createdAt: new Date(),
    updatedAt: new Date(),
    days: [],
    slots: [],
    ...overrides,
  } as never;
}

function buildSlot(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'slot-1',
    menuListId: 'list-1',
    slotType: SlotType.BANQUET,
    dayId: null,
    slotDate: null,
    mealType: null,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    ...overrides,
  } as never;
}

describe('MenuPlannerService', () => {
  let menuListRepository: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let menuDayRepository: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let menuSlotRepository: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let menuSlotItemRepository: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    findOneOrFail: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let recipesService: { findOne: jest.Mock };
  let usersService: { findOne: jest.Mock };
  let transactionManager: { update: jest.Mock };
  let dataSource: { transaction: jest.Mock };
  let service: MenuPlannerService;

  beforeEach(() => {
    jest.clearAllMocks();

    menuListRepository = {
      create: jest.fn().mockImplementation((entity) => entity),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    menuDayRepository = {
      create: jest.fn().mockImplementation((entity) => entity),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn(),
    };
    menuSlotRepository = {
      create: jest.fn().mockImplementation((entity) => entity),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    menuSlotItemRepository = {
      create: jest.fn().mockImplementation((entity) => entity),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn(),
    };
    recipesService = { findOne: jest.fn() };
    usersService = { findOne: jest.fn() };
    transactionManager = { update: jest.fn().mockResolvedValue(undefined) };
    dataSource = {
      transaction: jest.fn((cb: (m: unknown) => unknown) =>
        cb(transactionManager),
      ),
    };

    service = new MenuPlannerService(
      menuListRepository as never,
      menuDayRepository as never,
      menuSlotRepository as never,
      menuSlotItemRepository as never,
      recipesService as never,
      usersService as never,
      dataSource as never,
    );
  });

  describe('createMenuList', () => {
    it('применяет дефолты isActive=true и displayType=DAYS, если не переданы', async () => {
      const result = await service.createMenuList('user-1', {
        title: 'Новый список',
      } as never);

      expect(menuListRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          title: 'Новый список',
          isActive: true,
          displayType: DisplayType.DAYS,
        }),
      );
      expect(result.title).toBe('Новый список');
    });
  });

  describe('findOneMenuList / ownership', () => {
    it('бросает NotFoundException, если список не найден', async () => {
      menuListRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneMenuList('user-1', 'missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('бросает ForbiddenException, если список принадлежит другому пользователю', async () => {
      menuListRepository.findOne.mockResolvedValue(
        buildMenuList({ userId: 'other-user' }),
      );

      await expect(
        service.findOneMenuList('user-1', 'list-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('возвращает список, если он принадлежит запрашивающему пользователю', async () => {
      const list = buildMenuList();
      menuListRepository.findOne.mockResolvedValue(list);

      await expect(service.findOneMenuList('user-1', 'list-1')).resolves.toBe(
        list,
      );
    });
  });

  describe('updateMenuList', () => {
    it('обновляет только переданные поля после проверки владения', async () => {
      menuListRepository.findOne.mockResolvedValue(buildMenuList());

      const result = await service.updateMenuList('user-1', 'list-1', {
        title: 'Обновлённое название',
      } as never);

      expect(result.title).toBe('Обновлённое название');
      expect(menuListRepository.save).toHaveBeenCalledTimes(1);
    });

    it('не даёт обновить чужой список', async () => {
      menuListRepository.findOne.mockResolvedValue(
        buildMenuList({ userId: 'other-user' }),
      );

      await expect(
        service.updateMenuList('user-1', 'list-1', {
          title: 'x',
        } as never),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(menuListRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('removeMenuList', () => {
    it('не даёт удалить чужой список', async () => {
      menuListRepository.findOne.mockResolvedValue(
        buildMenuList({ userId: 'other-user' }),
      );

      await expect(
        service.removeMenuList('user-1', 'list-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(menuListRepository.remove).not.toHaveBeenCalled();
    });

    it('удаляет список владельца', async () => {
      const list = buildMenuList();
      menuListRepository.findOne.mockResolvedValue(list);

      await service.removeMenuList('user-1', 'list-1');

      expect(menuListRepository.remove).toHaveBeenCalledWith(list);
    });
  });

  describe('createDay', () => {
    it('бросает BadRequestException, если список не в режиме DAYS', async () => {
      menuListRepository.findOne.mockResolvedValue(
        buildMenuList({ displayType: DisplayType.BANQUET }),
      );

      await expect(
        service.createDay('user-1', 'list-1', {
          dayOrder: 1,
          title: 'День 1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('бросает BadRequestException при дублирующемся dayOrder', async () => {
      menuListRepository.findOne.mockResolvedValue(buildMenuList());
      menuDayRepository.findOne.mockResolvedValue({ id: 'day-existing' });

      await expect(
        service.createDay('user-1', 'list-1', {
          dayOrder: 1,
          title: 'День 1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(menuDayRepository.save).not.toHaveBeenCalled();
    });

    it('создаёт день, если режим DAYS и порядок свободен', async () => {
      menuListRepository.findOne.mockResolvedValue(buildMenuList());
      menuDayRepository.findOne.mockResolvedValue(null);

      const result = await service.createDay('user-1', 'list-1', {
        dayOrder: 1,
        title: 'День 1',
      });

      expect(result.title).toBe('День 1');
      expect(result.dayOrder).toBe(1);
    });
  });

  describe('reorderDays', () => {
    it('проверяет владение списком и обновляет порядок дней в транзакции', async () => {
      menuListRepository.findOne.mockResolvedValue(buildMenuList());

      await service.reorderDays('user-1', 'list-1', {
        items: [
          { id: 'day-1', order: 2 },
          { id: 'day-2', order: 1 },
        ],
      });

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(transactionManager.update).toHaveBeenCalledWith(MenuDay, 'day-1', {
        dayOrder: 2,
      });
      expect(transactionManager.update).toHaveBeenCalledWith(MenuDay, 'day-2', {
        dayOrder: 1,
      });
    });

    it('не даёт переупорядочить дни в чужом списке', async () => {
      menuListRepository.findOne.mockResolvedValue(
        buildMenuList({ userId: 'other-user' }),
      );

      await expect(
        service.reorderDays('user-1', 'list-1', { items: [] }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('addRecipeToSlot', () => {
    function mockOwnedSlot() {
      menuSlotRepository.findOne.mockResolvedValue(
        buildSlot({ menuList: buildMenuList() }),
      );
      menuListRepository.findOne.mockResolvedValue(buildMenuList());
      usersService.findOne.mockResolvedValue({
        id: 'user-1',
        role: UserRole.USER,
      });
      recipesService.findOne.mockResolvedValue({ id: 'recipe-1' });
    }

    it('бросает BadRequestException, если рецепт уже добавлен в слот', async () => {
      mockOwnedSlot();
      menuSlotItemRepository.findOne.mockResolvedValue({ id: 'existing-item' });

      await expect(
        service.addRecipeToSlot('user-1', 'slot-1', { recipeId: 'recipe-1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('проверяет доступ к рецепту через RecipesService с ролью пользователя', async () => {
      mockOwnedSlot();
      menuSlotItemRepository.findOne.mockResolvedValue(null);
      menuSlotItemRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      });
      menuSlotItemRepository.findOneOrFail.mockResolvedValue(
        new MenuSlotItem(),
      );

      await service.addRecipeToSlot('user-1', 'slot-1', {
        recipeId: 'recipe-1',
      });

      expect(recipesService.findOne).toHaveBeenCalledWith(
        'recipe-1',
        'user-1',
        UserRole.USER,
      );
    });

    it('назначает order = 0, когда слот пуст (MAX(order) = null)', async () => {
      mockOwnedSlot();
      menuSlotItemRepository.findOne.mockResolvedValue(null);
      menuSlotItemRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      });
      menuSlotItemRepository.findOneOrFail.mockResolvedValue(
        new MenuSlotItem(),
      );

      await service.addRecipeToSlot('user-1', 'slot-1', {
        recipeId: 'recipe-1',
      });

      expect(menuSlotItemRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ order: 0 }),
      );
    });

    it('продолжает нумерацию после текущего максимума order', async () => {
      mockOwnedSlot();
      menuSlotItemRepository.findOne.mockResolvedValue(null);
      menuSlotItemRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: '3' }),
      });
      menuSlotItemRepository.findOneOrFail.mockResolvedValue(
        new MenuSlotItem(),
      );

      await service.addRecipeToSlot('user-1', 'slot-1', {
        recipeId: 'recipe-1',
      });

      expect(menuSlotItemRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ order: 4 }),
      );
    });
  });

  describe('addBanquetItem', () => {
    it('бросает BadRequestException, если список не в режиме BANQUET', async () => {
      menuListRepository.findOne.mockResolvedValue(
        buildMenuList({ displayType: DisplayType.DAYS }),
      );

      await expect(
        service.addBanquetItem('user-1', 'list-1', { recipeId: 'recipe-1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('переиспользует существующий banquet-слот вместо создания нового', async () => {
      const banquetList = buildMenuList({ displayType: DisplayType.BANQUET });
      menuListRepository.findOne.mockResolvedValue(banquetList);

      const existingBanquetSlot = buildSlot({
        id: 'banquet-slot',
        slotType: SlotType.BANQUET,
        menuList: banquetList,
      });
      // 1-й вызов findOne — поиск существующего banquet-слота по menuListId+slotType,
      // 2-й — findOneSlot внутри addRecipeToSlot (поиск по id)
      menuSlotRepository.findOne
        .mockResolvedValueOnce(existingBanquetSlot)
        .mockResolvedValueOnce(existingBanquetSlot);

      usersService.findOne.mockResolvedValue({
        id: 'user-1',
        role: UserRole.USER,
      });
      recipesService.findOne.mockResolvedValue({ id: 'recipe-1' });
      menuSlotItemRepository.findOne.mockResolvedValue(null);
      menuSlotItemRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: null }),
      });
      menuSlotItemRepository.findOneOrFail.mockResolvedValue(
        new MenuSlotItem(),
      );

      await service.addBanquetItem('user-1', 'list-1', {
        recipeId: 'recipe-1',
      });

      expect(menuSlotRepository.save).not.toHaveBeenCalled();
      expect(menuSlotItemRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slotId: 'banquet-slot' }),
      );
    });
  });

  describe('getSlotsByDateRange', () => {
    it('запрашивает только CALENDAR-слоты в заданном диапазоне дат после проверки владения', async () => {
      menuListRepository.findOne.mockResolvedValue(buildMenuList());
      const start = new Date('2026-01-01');
      const end = new Date('2026-01-07');

      await service.getSlotsByDateRange('user-1', 'list-1', start, end);

      expect(menuSlotRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            menuListId: 'list-1',
            slotType: SlotType.CALENDAR,
          }),
        }),
      );
    });

    it('не даёт читать слоты чужого списка', async () => {
      menuListRepository.findOne.mockResolvedValue(
        buildMenuList({ userId: 'other-user' }),
      );

      await expect(
        service.getSlotsByDateRange('user-1', 'list-1', new Date(), new Date()),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});

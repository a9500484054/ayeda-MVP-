import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingList } from './entities/shopping-list.entity';
import { ShoppingListItem } from './entities/shopping-list-item.entity';

function buildList(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'list-1',
    userId: 'user-1',
    title: 'Список покупок',
    shareToken: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    ...overrides,
  } as never;
}

function buildItem(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'item-1',
    shoppingListId: 'list-1',
    name: 'Молоко',
    categoryId: null,
    quantity: 1,
    unit: 'шт',
    price: null,
    isChecked: false,
    sortOrder: 1000,
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: null,
    ...overrides,
  } as never;
}

function fakeQueryBuilder(terminal: {
  getRawOne?: unknown;
  getRawMany?: unknown;
  getOne?: unknown;
}) {
  const qb: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue(terminal.getRawOne ?? null),
    getRawMany: jest.fn().mockResolvedValue(terminal.getRawMany ?? []),
    getOne: jest.fn().mockResolvedValue(terminal.getOne ?? null),
  };
  return qb;
}

describe('ShoppingListsService', () => {
  let shoppingListRepository: {
    count: jest.Mock;
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    softRemove: jest.Mock;
  };
  let shoppingListItemRepository: {
    create: jest.Mock;
    createQueryBuilder: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };
  let shoppingCategoriesService: { findOne: jest.Mock };
  let dataSource: { transaction: jest.Mock; manager: unknown };
  let service: ShoppingListsService;

  beforeEach(() => {
    jest.clearAllMocks();

    shoppingListRepository = {
      count: jest.fn().mockResolvedValue(0),
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      softRemove: jest.fn().mockResolvedValue(undefined),
    };
    shoppingListItemRepository = {
      create: jest.fn().mockImplementation((entity) => entity),
      createQueryBuilder: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      update: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    shoppingCategoriesService = { findOne: jest.fn() };
    dataSource = {
      transaction: jest.fn((cb: (m: unknown) => unknown) => cb({})),
      manager: {},
    };

    service = new ShoppingListsService(
      shoppingListRepository as never,
      shoppingListItemRepository as never,
      shoppingCategoriesService as never,
      dataSource as never,
    );
  });

  describe('create', () => {
    it('бросает BadRequestException при превышении лимита списков (20)', async () => {
      shoppingListRepository.count.mockResolvedValue(20);

      await expect(
        service.create('user-1', { title: 'Новый список' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('создаёт список с sortOrder = MAX(sortOrder)+1, если не передан явно', async () => {
      shoppingListRepository.createQueryBuilder.mockReturnValue(
        fakeQueryBuilder({ getRawOne: { max: '5' } }),
      );

      const savedList = buildList({ sortOrder: 6 });
      const fakeManager = {
        save: jest.fn().mockResolvedValue(savedList),
        findOne: jest.fn().mockResolvedValue(savedList),
        createQueryBuilder: jest.fn().mockReturnValue(
          fakeQueryBuilder({
            getRawOne: { totalItems: '0', checkedItems: '0' },
          }),
        ),
      };
      dataSource.transaction.mockImplementation((cb: (m: unknown) => unknown) =>
        cb(fakeManager),
      );

      await service.create('user-1', { title: 'Новый список' });

      const savedArg = fakeManager.save.mock.calls[0][0] as ShoppingList;
      expect(savedArg.sortOrder).toBe(6);
    });
  });

  describe('update / remove — владение списком', () => {
    it('бросает NotFoundException, если список не найден', async () => {
      shoppingListRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'missing', { title: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('бросает ForbiddenException при обновлении чужого списка', async () => {
      shoppingListRepository.findOne.mockResolvedValue(
        buildList({ userId: 'other-user' }),
      );

      await expect(
        service.update('user-1', 'list-1', { title: 'x' }),
      ).rejects.toMatchObject({ status: 403 });
    });

    it('remove делает soft delete через softRemove, а не hard delete', async () => {
      const list = buildList();
      shoppingListRepository.findOne.mockResolvedValue(list);

      await service.remove('user-1', 'list-1');

      expect(shoppingListRepository.softRemove).toHaveBeenCalledWith(list);
    });
  });

  describe('reorder', () => {
    it('бросает BadRequestException, если список не принадлежит пользователю', async () => {
      const fakeManager = { findOne: jest.fn().mockResolvedValue(null) };
      dataSource.transaction.mockImplementation((cb: (m: unknown) => unknown) =>
        cb(fakeManager),
      );

      await expect(
        service.reorder('user-1', [{ id: 'list-1', sortOrder: 1 }]),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('обновляет sortOrder только для списков, принадлежащих пользователю', async () => {
      const fakeManager = {
        findOne: jest.fn().mockResolvedValue(buildList()),
        update: jest.fn().mockResolvedValue(undefined),
      };
      dataSource.transaction.mockImplementation((cb: (m: unknown) => unknown) =>
        cb(fakeManager),
      );
      shoppingListRepository.createQueryBuilder.mockReturnValue(
        fakeQueryBuilder({ getRawMany: [] }),
      );

      await service.reorder('user-1', [{ id: 'list-1', sortOrder: 3 }]);

      expect(fakeManager.update).toHaveBeenCalledWith(ShoppingList, 'list-1', {
        sortOrder: 3,
      });
    });
  });

  describe('generateShareToken / revokeShareToken', () => {
    it('возвращает уже существующий токен без генерации нового', async () => {
      shoppingListRepository.findOne.mockResolvedValue(
        buildList({ shareToken: 'existing-token' }),
      );

      const token = await service.generateShareToken('user-1', 'list-1');

      expect(token).toBe('existing-token');
      expect(shoppingListRepository.save).not.toHaveBeenCalled();
    });

    it('генерирует новый токен, если его ещё нет', async () => {
      shoppingListRepository.findOne.mockResolvedValue(
        buildList({ shareToken: null }),
      );

      const token = await service.generateShareToken('user-1', 'list-1');

      expect(token).toMatch(/^[0-9a-f]{64}$/);
      expect(shoppingListRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ shareToken: token }),
      );
    });

    it('revokeShareToken сбрасывает токен в null', async () => {
      shoppingListRepository.findOne.mockResolvedValue(
        buildList({ shareToken: 'some-token' }),
      );

      await service.revokeShareToken('user-1', 'list-1');

      expect(shoppingListRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ shareToken: null }),
      );
    });
  });

  describe('addItem', () => {
    it('проверяет доступ к списку раньше валидации категории', async () => {
      shoppingListRepository.findOne.mockResolvedValue(
        buildList({ userId: 'other-user' }),
      );

      await expect(
        service.addItem('user-1', 'list-1', { name: 'Хлеб' }),
      ).rejects.toMatchObject({ status: 403 });
      expect(shoppingCategoriesService.findOne).not.toHaveBeenCalled();
    });

    it('назначает sortOrder = MAX(sortOrder)+1000', async () => {
      shoppingListRepository.findOne.mockResolvedValue(buildList());
      shoppingListItemRepository.createQueryBuilder.mockReturnValue(
        fakeQueryBuilder({ getRawOne: { max: '2000' } }),
      );
      shoppingListItemRepository.findOne.mockResolvedValue(buildItem());

      await service.addItem('user-1', 'list-1', { name: 'Хлеб' });

      expect(shoppingListItemRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ sortOrder: 3000 }),
      );
    });
  });

  describe('updateItem / removeItem / toggleItem — кросс-списочная защита', () => {
    it('updateItem: BadRequestException, если позиция не принадлежит указанному списку', async () => {
      shoppingListRepository.findOne.mockResolvedValue(buildList());
      shoppingListItemRepository.findOne.mockResolvedValue(null); // findOne({id, shoppingListId: listId}) не находит

      await expect(
        service.updateItem('user-1', 'list-1', 'item-from-another-list', {
          name: 'x',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('removeItem: BadRequestException, если item.shoppingListId не совпадает с listId', async () => {
      shoppingListRepository.findOne.mockResolvedValue(buildList());
      shoppingListItemRepository.findOne.mockResolvedValue(
        buildItem({ shoppingListId: 'another-list' }),
      );

      await expect(
        service.removeItem('user-1', 'list-1', 'item-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(shoppingListItemRepository.remove).not.toHaveBeenCalled();
    });

    it('toggleItem инвертирует isChecked через updateItem', async () => {
      shoppingListRepository.findOne.mockResolvedValue(buildList());
      shoppingListItemRepository.findOne
        .mockResolvedValueOnce(buildItem({ isChecked: false })) // findOneItem в toggleItem
        .mockResolvedValueOnce(
          buildItem({ id: 'item-1', shoppingListId: 'list-1' }),
        ) // updateItem: existingItem
        .mockResolvedValueOnce(buildItem({ isChecked: true })); // updateItem: updatedItem после update()

      const result = await service.toggleItem('user-1', 'list-1', 'item-1');

      expect(shoppingListItemRepository.update).toHaveBeenCalledWith(
        { id: 'item-1' },
        expect.objectContaining({ isChecked: true }),
      );
      expect(result.isChecked).toBe(true);
    });
  });

  describe('addItemsBulk', () => {
    it('бросает BadRequestException для пустого списка позиций', async () => {
      shoppingListRepository.findOne.mockResolvedValue(buildList());

      await expect(
        service.addItemsBulk('user-1', 'list-1', []),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('каждой позиции присваивается уникальный возрастающий sortOrder', async () => {
      shoppingListRepository.findOne.mockResolvedValue(buildList());
      // getRawOne.max приходит из Postgres строкой — намеренно непустая строка,
      // чтобы тест ловил баг конкатенации строк вместо сложения ('5000' + 1000 = '50001000')
      shoppingListItemRepository.createQueryBuilder.mockReturnValue(
        fakeQueryBuilder({ getRawOne: { max: '5000' } }),
      );
      shoppingListItemRepository.save.mockImplementation((entities) =>
        Promise.resolve(
          (entities as Array<Record<string, unknown>>).map((e, i) => ({
            ...e,
            id: `item-${i}`,
          })),
        ),
      );
      shoppingListItemRepository.find.mockResolvedValue([]);

      await service.addItemsBulk('user-1', 'list-1', [
        { name: 'Молоко' },
        { name: 'Хлеб' },
        { name: 'Яйца' },
      ]);

      const created = shoppingListItemRepository.create.mock.calls.map(
        (call) => (call[0] as { sortOrder: number }).sortOrder,
      );

      expect(created).toEqual([6000, 7000, 8000]);
      expect(new Set(created).size).toBe(3); // все разные, а не одно и то же значение
    });
  });

  describe('copy', () => {
    it('бросает BadRequestException при превышении лимита списков', async () => {
      shoppingListRepository.count.mockResolvedValue(20);

      await expect(service.copy('user-1', 'list-1', {})).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('копия всегда создаётся с непроверенными позициями и без share-токена', async () => {
      const originalList = buildList({
        title: 'Оригинал',
        items: [buildItem({ isChecked: true, name: 'Молоко' })],
      });
      shoppingListRepository.findOne.mockResolvedValue(originalList);
      shoppingListRepository.createQueryBuilder.mockReturnValue(
        fakeQueryBuilder({ getRawOne: { max: null } }),
      );

      const fakeManager = {
        create: jest.fn().mockImplementation((_entity, data) => data),
        save: jest.fn().mockImplementation((entity) => {
          if (Array.isArray(entity)) return Promise.resolve(entity);
          return Promise.resolve({ ...entity, id: 'list-copy' });
        }),
        findOne: jest
          .fn()
          .mockResolvedValue(
            buildList({ id: 'list-copy', title: 'Оригинал (копия)' }),
          ),
        createQueryBuilder: jest.fn().mockReturnValue(
          fakeQueryBuilder({
            getRawOne: { totalItems: '1', checkedItems: '0' },
          }),
        ),
      };
      dataSource.transaction.mockImplementation((cb: (m: unknown) => unknown) =>
        cb(fakeManager),
      );

      await service.copy('user-1', 'list-1', {});

      const itemCreateCalls = fakeManager.create.mock.calls.filter(
        (call) => call[0] === ShoppingListItem,
      );
      expect(itemCreateCalls[0][1]).toMatchObject({
        isChecked: false,
        name: 'Молоко',
      });

      const listCreateCall = fakeManager.create.mock.calls.find(
        (call) => call[0] === ShoppingList,
      );
      expect(listCreateCall?.[1]).toMatchObject({ shareToken: null });
    });

    it('вычисляет sortOrder новой копии как число, а не строковую конкатенацию', async () => {
      const originalList = buildList({ title: 'Оригинал', items: [] });
      shoppingListRepository.findOne.mockResolvedValue(originalList);
      // getRawOne.max — непустая строка из Postgres: ловит баг '5000' + 1000 = '50001000'
      shoppingListRepository.createQueryBuilder.mockReturnValue(
        fakeQueryBuilder({ getRawOne: { max: '5000' } }),
      );

      const fakeManager = {
        create: jest.fn().mockImplementation((_entity, data) => data),
        save: jest.fn().mockImplementation((entity) => {
          if (Array.isArray(entity)) return Promise.resolve(entity);
          return Promise.resolve({ ...entity, id: 'list-copy' });
        }),
        findOne: jest.fn().mockResolvedValue(buildList({ id: 'list-copy' })),
        createQueryBuilder: jest.fn().mockReturnValue(
          fakeQueryBuilder({
            getRawOne: { totalItems: '0', checkedItems: '0' },
          }),
        ),
      };
      dataSource.transaction.mockImplementation((cb: (m: unknown) => unknown) =>
        cb(fakeManager),
      );

      await service.copy('user-1', 'list-1', {});

      const listCreateCall = fakeManager.create.mock.calls.find(
        (call) => call[0] === ShoppingList,
      );
      expect(listCreateCall?.[1]).toMatchObject({ sortOrder: 6000 });
    });
  });
});

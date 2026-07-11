import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { UnitsService } from '../units/units.service';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    private unitsService: UnitsService,
  ) {}

  private async ensureUniqueSrcPath(srcPath: string): Promise<string> {
    let uniquePath = srcPath;
    let counter = 1;

    while (true) {
      const exists = await this.ingredientsRepository.findOne({
        where: { srcPath: uniquePath },
        withDeleted: true,
      });

      if (!exists) {
        break;
      }

      uniquePath = `${srcPath}-${counter}`;
      counter++;
    }

    return uniquePath;
  }

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    // Проверяем существование unit
    const unit = await this.unitsService.findOne(createIngredientDto.unitId);

    // Проверяем уникальность code
    const existingCode = await this.ingredientsRepository.findOne({
      where: { code: createIngredientDto.code },
    });
    if (existingCode) {
      throw new ConflictException('Ингредиент с таким кодом уже существует');
    }

    // Если srcPath не передан - он сгенерируется в entity
    let srcPath = createIngredientDto.srcPath;
    if (srcPath) {
      // Проверяем уникальность srcPath
      srcPath = await this.ensureUniqueSrcPath(srcPath);
    }

    // Создаем ингредиент
    const ingredient = this.ingredientsRepository.create({
      srcPath,
      code: createIngredientDto.code,
      name: createIngredientDto.name,
      description: createIngredientDto.description,
      photo: createIngredientDto.photo,
      unit,
      unitId: createIngredientDto.unitId,
      nutritionInfo: createIngredientDto.nutritionInfo || {},
      seo: createIngredientDto.seo || {},
    });

    return this.ingredientsRepository.save(ingredient);
  }

  async findAll(): Promise<Ingredient[]> {
    return this.ingredientsRepository.find({
      relations: ['unit'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOne({
      where: { id },
      relations: ['unit'],
    });
    if (!ingredient) {
      throw new NotFoundException('Ингредиент не найден');
    }
    return ingredient;
  }

  async findBySrcPath(srcPath: string): Promise<Ingredient> {
    const ingredient = await this.ingredientsRepository.findOne({
      where: { srcPath },
      relations: ['unit'],
    });
    if (!ingredient) {
      throw new NotFoundException('Ингредиент не найден');
    }
    return ingredient;
  }

  async findByCode(code: string): Promise<Ingredient | null> {
    return this.ingredientsRepository.findOne({
      where: { code },
      relations: ['unit'],
    });
  }

  async search(query: string): Promise<Ingredient[]> {
    return this.ingredientsRepository
      .createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.unit', 'unit')
      .where(
        'LOWER(ingredient.name) LIKE LOWER(:query) OR LOWER(ingredient.code) LIKE LOWER(:query)',
        {
          query: `%${query}%`,
        },
      )
      .orderBy('ingredient.name', 'ASC')
      .take(20)
      .getMany();
  }

  async update(
    id: string,
    updateIngredientDto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    const ingredient = await this.findOne(id);

    // Если меняется unitId, проверяем существование unit
    if (
      updateIngredientDto.unitId &&
      updateIngredientDto.unitId !== ingredient.unitId
    ) {
      const unit = await this.unitsService.findOne(updateIngredientDto.unitId);
      ingredient.unit = unit;
      ingredient.unitId = updateIngredientDto.unitId;
    }

    // Проверяем уникальность code при изменении
    if (
      updateIngredientDto.code &&
      updateIngredientDto.code !== ingredient.code
    ) {
      const existingCode = await this.ingredientsRepository.findOne({
        where: { code: updateIngredientDto.code },
      });
      if (existingCode) {
        throw new ConflictException('Ингредиент с таким кодом уже существует');
      }
      ingredient.code = updateIngredientDto.code;
    }

    // Проверяем уникальность srcPath при изменении
    if (
      updateIngredientDto.srcPath &&
      updateIngredientDto.srcPath !== ingredient.srcPath
    ) {
      const existingSrcPath = await this.ingredientsRepository.findOne({
        where: { srcPath: updateIngredientDto.srcPath },
        withDeleted: true,
      });
      if (existingSrcPath) {
        throw new ConflictException('Ингредиент с таким путем уже существует');
      }
      ingredient.srcPath = updateIngredientDto.srcPath;
    }

    // Обновляем поля
    if (updateIngredientDto.name) {
      ingredient.name = updateIngredientDto.name;
    }

    if (updateIngredientDto.description !== undefined) {
      ingredient.description = updateIngredientDto.description;
    }

    if (updateIngredientDto.photo !== undefined) {
      ingredient.photo = updateIngredientDto.photo;
    }

    // Обновляем nutritionInfo если передан
    if (updateIngredientDto.nutritionInfo) {
      ingredient.nutritionInfo = {
        ...ingredient.nutritionInfo,
        ...updateIngredientDto.nutritionInfo,
      };
    }

    // Обновляем seo если передан
    if (updateIngredientDto.seo) {
      ingredient.seo = {
        ...ingredient.seo,
        ...updateIngredientDto.seo,
      };
    }

    return this.ingredientsRepository.save(ingredient);
  }

  async remove(id: string): Promise<void> {
    const ingredient = await this.findOne(id);
    await this.ingredientsRepository.remove(ingredient);
  }

  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<[Ingredient[], number]> {
    const skip = (page - 1) * limit;

    const [ingredients, total] = await this.ingredientsRepository.findAndCount({
      relations: ['unit'],
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    return [ingredients, total];
  }

  async searchWithPagination(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Ingredient[], number]> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.ingredientsRepository
      .createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.unit', 'unit')
      .where('LOWER(ingredient.name) LIKE LOWER(:query) OR LOWER(ingredient.code) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orderBy('ingredient.name', 'ASC')
      .skip(skip)
      .take(limit);

    const [ingredients, total] = await queryBuilder.getManyAndCount();

    return [ingredients, total];
  }

  async findSimilar(id: string, limit: number = 5): Promise<Ingredient[]> {
    const ingredient = await this.findOne(id);

    const results = await this.ingredientsRepository
      .createQueryBuilder('ingredient')
      .leftJoinAndSelect('ingredient.unit', 'unit')
      .where('ingredient.id != :id', { id })
      .andWhere(
        '(LOWER(ingredient.name) LIKE LOWER(:search) OR LOWER(ingredient.code) LIKE LOWER(:search))',
        { search: `%${ingredient.name.split(' ')[0]}%` }
      )
      .orderBy('ingredient.name', 'ASC')
      .take(limit)
      .getMany();

    return results;
  }
}

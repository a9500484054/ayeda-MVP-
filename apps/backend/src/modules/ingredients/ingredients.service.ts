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

    // Создаем ингредиент с nutritionInfo по умолчанию
    const ingredient = this.ingredientsRepository.create({
      code: createIngredientDto.code,
      name: createIngredientDto.name,
      unit,
      unitId: createIngredientDto.unitId,
      nutritionInfo: createIngredientDto.nutritionInfo || {}, // если не передан - пустой объект
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

    // Обновляем name если передан
    if (updateIngredientDto.name) {
      ingredient.name = updateIngredientDto.name;
    }

    // Обновляем nutritionInfo если передан (мержим с существующим)
    if (updateIngredientDto.nutritionInfo) {
      ingredient.nutritionInfo = {
        ...ingredient.nutritionInfo,
        ...updateIngredientDto.nutritionInfo,
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
}

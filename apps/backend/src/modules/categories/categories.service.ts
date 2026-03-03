import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Проверяем уникальность code
    const existingCode = await this.categoriesRepository.findOne({
      where: { code: createCategoryDto.code },
    });
    if (existingCode) {
      throw new ConflictException('Категория с таким кодом уже существует');
    }

    // Проверяем уникальность name
    const existingName = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name },
    });
    if (existingName) {
      throw new ConflictException('Категория с таким названием уже существует');
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // Проверяем уникальность code при изменении
    if (updateCategoryDto.code && updateCategoryDto.code !== category.code) {
      const existingCode = await this.categoriesRepository.findOne({
        where: { code: updateCategoryDto.code },
      });
      if (existingCode) {
        throw new ConflictException('Категория с таким кодом уже существует');
      }
    }

    // Проверяем уникальность name при изменении
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingName = await this.categoriesRepository.findOne({
        where: { name: updateCategoryDto.name },
      });
      if (existingName) {
        throw new ConflictException(
          'Категория с таким названием уже существует',
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }

  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<[Category[], number]> {
    const skip = (page - 1) * limit;

    const [categories, total] = await this.categoriesRepository.findAndCount({
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    return [categories, total];
  }
}

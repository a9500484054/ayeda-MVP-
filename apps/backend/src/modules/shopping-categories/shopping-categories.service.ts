import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingCategory } from './entities/shopping-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class ShoppingCategoriesService {
  private defaultCategoryId: string | null = null;

  constructor(
    @InjectRepository(ShoppingCategory)
    private categoryRepository: Repository<ShoppingCategory>,
  ) {}

  private toResponseDto(category: ShoppingCategory): CategoryResponseDto {
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

  private async loadDefaultCategoryId(): Promise<string> {
    if (this.defaultCategoryId) return this.defaultCategoryId;

    const defaultCategory = await this.categoryRepository.findOne({
      where: { code: 'other' },
    });

    if (!defaultCategory) {
      throw new BadRequestException('Default category "other" not found');
    }

    this.defaultCategoryId = defaultCategory.id;
    return this.defaultCategoryId;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Category with code "${dto.code}" already exists`);
    }

    const category = this.categoryRepository.create({
      code: dto.code,
      name: dto.name,
      icon: dto.icon,
      sortOrder: dto.sortOrder ?? 0,
    });

    const saved = await this.categoryRepository.save(category);
    return this.toResponseDto(saved);
  }

  async findAll(activeOnly: boolean = true): Promise<CategoryResponseDto[]> {
    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const categories = await this.categoryRepository.find({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return categories.map((cat) => this.toResponseDto(cat));
  }

  async findAllForAdmin(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return categories.map((cat) => this.toResponseDto(cat));
  }

  async findOne(id: string): Promise<ShoppingCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  async findOneResponse(id: string): Promise<CategoryResponseDto> {
    return this.toResponseDto(await this.findOne(id));
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.findOne(id);

    Object.assign(category, dto);

    const saved = await this.categoryRepository.save(category);
    return this.toResponseDto(saved);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    const defaultCategoryId = await this.loadDefaultCategoryId();

    if (category.id === defaultCategoryId) {
      throw new BadRequestException('Cannot delete default category "other"');
    }

    await this.categoryRepository.remove(category);
  }

  async getDefaultCategoryId(): Promise<string> {
    return this.loadDefaultCategoryId();
  }
}

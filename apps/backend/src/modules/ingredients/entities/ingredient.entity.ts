import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Unit } from '../../units/entities/unit.entity';
import { v4 as uuidv4 } from 'uuid';

export interface NutritionInfo {
  calories?: number;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  fiber?: number;
  sugar?: number;
  [key: string]: number | undefined;
}

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  [key: string]: any;
}

@Entity('ingredients')
export class Ingredient {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'abrikos', description: 'Уникальный путь (slug)' })
  @Column({ name: 'src_path', unique: true, length: 120 })
  srcPath: string;

  @ApiProperty({ example: 'abrikos', description: 'Уникальный код ингредиента' })
  @Column({ unique: true, length: 50 })
  code: string;

  @ApiProperty({ example: 'Абрикос', description: 'Название ингредиента' })
  @Column({ length: 100 })
  name: string;

  @ApiPropertyOptional({
    example: 'Сладкий сочный абрикос, богатый витаминами',
    description: 'Описание ингредиента',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({
    example: '/uploads/general/.../image.png',
    description: 'Путь к фото ингредиента',
  })
  @Column({ type: 'varchar', length: 512, nullable: true })
  photo?: string;

  @ApiProperty({ type: () => Unit, description: 'Единица измерения' })
  @ManyToOne(() => Unit, { eager: true })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({ name: 'unit_id' })
  unitId: string;

  @ApiProperty({
    example: { calories: 50, proteins: 3.5, fats: 2.5, carbohydrates: 4.8 },
    description: 'Пищевая ценность',
    type: 'object',
    properties: {
      calories: { type: 'number', example: 50 },
      proteins: { type: 'number', example: 3.5 },
      fats: { type: 'number', example: 2.5 },
      carbohydrates: { type: 'number', example: 4.8 },
    },
    required: ['calories', 'proteins', 'fats', 'carbohydrates'],
  })
  @Column({ type: 'jsonb', name: 'nutrition_info', default: {} })
  nutritionInfo: NutritionInfo;

  @ApiPropertyOptional({
    description: 'SEO данные для ингредиента',
    type: 'object',
    additionalProperties: true,
  })
  @Column({ type: 'jsonb', name: 'seo', nullable: true, default: {} })
  seo?: SeoData;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generateSrcPath() {
    if (!this.srcPath) {
      this.srcPath = this.generateSlug(this.name);
    }
  }

  private generateSlug(text: string): string {
    // Транслитерация с русского на латиницу
    const translitMap: { [key: string]: string } = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    let slug = text
      .toLowerCase()
      .trim()
      .split('')
      .map(char => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9-]/g, '-') // заменяем все не буквы и не цифры на дефис
      .replace(/-+/g, '-') // убираем множественные дефисы
      .replace(/^-|-$/g, ''); // убираем дефисы в начале и конце

    // Если получился пустой slug, генерируем из UUID
    if (!slug) {
      slug = uuidv4().substring(0, 8);
    }

    return slug;
  }
}

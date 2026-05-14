import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MenuSlot } from './menu-slot.entity';
import { Recipe } from '../../recipes/entities/recipe.entity';

@Entity('menu_slot_items')
export class MenuSlotItem {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'slot_id' })
  slotId: string;

  @ApiProperty()
  @Column({ name: 'recipe_id' })
  recipeId: string;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  order: number;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => MenuSlot, (slot) => slot.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slot_id' })
  slot: MenuSlot;

  @ManyToOne(() => Recipe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;
}

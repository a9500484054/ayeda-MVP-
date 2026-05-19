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
import { ShoppingList } from './shopping-list.entity';
import { ShoppingCategory } from '../../shopping-categories/entities/shopping-category.entity';

@Entity('shopping_list_items')
export class ShoppingListItem {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'shopping_list_id', type: 'uuid' })
  shoppingListId: string;

  @ApiProperty()
  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @ApiProperty({ nullable: true })
  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ApiProperty({ default: 1 })
  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2, default: 1 })
  quantity: number;

  @ApiProperty({ default: 'шт' })
  @Column({ name: 'unit', type: 'varchar', length: 20, default: 'шт' })
  unit: string;

  @ApiProperty({ nullable: true })
  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number | null;

  @ApiProperty({ default: false })
  @Column({ name: 'is_checked', type: 'boolean', default: false })
  isChecked: boolean;

  @ApiProperty({ default: 0 })
  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @ApiProperty({ nullable: true })
  @Column({ name: 'note', type: 'text', nullable: true })
  note: string | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => ShoppingList, (list) => list.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shopping_list_id' })
  shoppingList: ShoppingList;

  @ManyToOne(() => ShoppingCategory, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: ShoppingCategory | null;
}

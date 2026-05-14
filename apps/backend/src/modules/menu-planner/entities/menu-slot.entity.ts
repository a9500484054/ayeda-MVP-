import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MenuList } from './menu-list.entity';
import { MenuSlotItem } from './menu-slot-item.entity';
import { MealType } from '../enums/meal-type.enum';

@Entity('menu_slots')
export class MenuSlot {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'menu_list_id' })
  menuListId: string;

  @ApiProperty({ required: false, type: 'string', format: 'date' })
  @Column({ name: 'slot_date', type: 'date', nullable: true })
  slotDate: Date | null;

  @ApiProperty({ enum: MealType })
  @Column({
    name: 'meal_type',
    type: 'enum',
    enum: MealType,
  })
  mealType: MealType;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => MenuList, (menuList) => menuList.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_list_id' })
  menuList: MenuList;

  @OneToMany(() => MenuSlotItem, (item) => item.slot)
  items: MenuSlotItem[];
}

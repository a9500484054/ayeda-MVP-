// apps\backend\src\modules\menu-planner\entities\menu-slot.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MenuList } from './menu-list.entity';
import { MenuDay } from './menu-day.entity';
import { MenuSlotItem } from './menu-slot-item.entity';
import { SlotType } from '../enums/slot-type.enum';
import { MealType } from '../enums/meal-type.enum';

@Entity('menu_slots')
export class MenuSlot {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'menu_list_id' })
  menuListId: string;

  @ApiProperty({ enum: SlotType })
  @Column({
    name: 'slot_type',
    type: 'enum',
    enum: SlotType,
  })
  slotType: SlotType;

  @ApiProperty({ required: false })
  @Column({ name: 'day_id', nullable: true })
  dayId: string;

  @ApiProperty({ required: false, type: 'string', format: 'date' })
  @Column({ name: 'slot_date', type: 'date', nullable: true })
  slotDate: Date | null;

  @ApiProperty({ enum: MealType, required: false })
  @Column({
    name: 'meal_type',
    type: 'enum',
    enum: MealType,
    nullable: true,
  })
  mealType: MealType | null;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  order: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ required: false })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => MenuList, (menuList) => menuList.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_list_id' })
  menuList: MenuList;

  @ManyToOne(() => MenuDay, (day) => day.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'day_id' })
  day: MenuDay;

  @OneToMany(() => MenuSlotItem, (item) => item.slot)
  items: MenuSlotItem[];
}

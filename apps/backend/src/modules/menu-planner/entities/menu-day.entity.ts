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
import { MenuSlot } from './menu-slot.entity';

@Entity('menu_days')
export class MenuDay {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'menu_list_id' })
  menuListId: string;

  @ApiProperty()
  @Column({ name: 'day_order' })
  dayOrder: number;

  @ApiProperty()
  @Column({ length: 100 })
  title: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Удаляем @DeleteDateColumn, так как используем физическое удаление

  @ManyToOne(() => MenuList, (menuList) => menuList.days, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_list_id' })
  menuList: MenuList;

  @OneToMany(() => MenuSlot, (slot) => slot.day)
  slots: MenuSlot[];
}

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
import { User } from '../../users/entities/user.entity';
import { MenuDay } from './menu-day.entity';
import { MenuSlot } from './menu-slot.entity';
import { DisplayType } from '../enums/display-type.enum';

@Entity('menu_lists')
export class MenuList {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty()
  @Column({ length: 100 })
  title: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ required: false })
  @Column({ length: 50, nullable: true })
  icon: string;

  @ApiProperty({ default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ enum: DisplayType, default: DisplayType.DAYS })
  @Column({
    name: 'display_type',
    type: 'enum',
    enum: DisplayType,
    default: DisplayType.DAYS,
  })
  displayType: DisplayType;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ required: false })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => MenuDay, (day) => day.menuList)
  days: MenuDay[];

  @OneToMany(() => MenuSlot, (slot) => slot.menuList)
  slots: MenuSlot[];
}

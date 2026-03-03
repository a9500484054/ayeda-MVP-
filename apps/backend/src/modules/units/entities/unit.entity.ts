import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UnitType {
  MASS = 'mass',
  VOLUME = 'volume',
  PIECE = 'piece',
  OTHER = 'other',
}

@Entity('units')
export class Unit {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'kg', description: 'Код единицы измерения' })
  @Column({ unique: true, length: 20 })
  code: string;

  @ApiProperty({ example: 'килограмм', description: 'Название' })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ example: 'кг', description: 'Краткое обозначение' })
  @Column({ length: 10 })
  short: string;

  @ApiProperty({
    enum: UnitType,
    example: UnitType.MASS,
    description: 'Тип единицы измерения',
  })
  @Column({
    type: 'enum',
    enum: UnitType,
  })
  type: UnitType;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

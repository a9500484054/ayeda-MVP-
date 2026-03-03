import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const existing = await this.unitsRepository.findOne({
      where: { code: createUnitDto.code },
    });
    if (existing) {
      throw new ConflictException(
        'Единица измерения с таким кодом уже существует',
      );
    }

    const unit = this.unitsRepository.create(createUnitDto);
    return this.unitsRepository.save(unit);
  }

  async findAll(): Promise<Unit[]> {
    return this.unitsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Unit> {
    const unit = await this.unitsRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException('Единица измерения не найдена');
    }
    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOne(id);

    if (updateUnitDto.code && updateUnitDto.code !== unit.code) {
      const existing = await this.unitsRepository.findOne({
        where: { code: updateUnitDto.code },
      });
      if (existing) {
        throw new ConflictException(
          'Единица измерения с таким кодом уже существует',
        );
      }
    }

    Object.assign(unit, updateUnitDto);
    return this.unitsRepository.save(unit);
  }

  async remove(id: string): Promise<void> {
    const unit = await this.findOne(id);
    await this.unitsRepository.remove(unit);
  }
}

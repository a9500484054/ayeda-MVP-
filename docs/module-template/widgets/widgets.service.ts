import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { UserRole } from '../users/entities/user.entity';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { WidgetResponseDto } from './dto/widget-response.dto';
import { WidgetsQueryDto } from './dto/widgets-query.dto';
import { Widget, WidgetStatus } from './entities/widget.entity';

interface Actor {
  id: string;
  role: UserRole;
}

@Injectable()
export class WidgetsService {
  constructor(
    @InjectRepository(Widget)
    private readonly widgets: Repository<Widget>,
    private readonly dataSource: DataSource,
  ) {}

  async create(actor: Actor, dto: CreateWidgetDto): Promise<WidgetResponseDto> {
    const widget = this.widgets.create({ ...dto, ownerId: actor.id });
    const saved = await this.widgets.save(widget);
    return this.toResponse(await this.findEntityOrFail(saved.id));
  }

  async findAll(
    query: WidgetsQueryDto,
  ): Promise<PaginatedResponseDto<WidgetResponseDto>> {
    const { page = 1, limit = 10, status, q } = query;

    const qb = this.widgets
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.owner', 'owner')
      .where('w.deletedAt IS NULL');

    if (status) qb.andWhere('w.status = :status', { status });
    if (q?.trim()) qb.andWhere('w.title ILIKE :q', { q: `%${q.trim()}%` });

    qb.orderBy('w.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(
      rows.map((w) => this.toResponse(w)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<WidgetResponseDto> {
    return this.toResponse(await this.findEntityOrFail(id));
  }

  async update(
    actor: Actor,
    id: string,
    dto: UpdateWidgetDto,
  ): Promise<WidgetResponseDto> {
    const widget = await this.findEntityOrFail(id);
    this.assertCanModify(actor, widget);

    Object.assign(widget, dto);
    await this.widgets.save(widget);
    return this.toResponse(await this.findEntityOrFail(id));
  }

  async setStatus(
    actor: Actor,
    id: string,
    status: WidgetStatus,
  ): Promise<WidgetResponseDto> {
    const widget = await this.findEntityOrFail(id);
    this.assertCanModify(actor, widget);

    widget.status = status;
    await this.widgets.save(widget);
    return this.toResponse(widget);
  }

  async remove(actor: Actor, id: string): Promise<void> {
    const widget = await this.findEntityOrFail(id);
    this.assertCanModify(actor, widget);
    await this.widgets.softRemove(widget);
  }

  // --- helpers ---

  private async findEntityOrFail(id: string): Promise<Widget> {
    const widget = await this.widgets.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['owner'],
    });
    if (!widget) throw new NotFoundException('Виджет не найден');
    return widget;
  }

  private assertCanModify(actor: Actor, widget: Widget): void {
    const isOwner = widget.ownerId === actor.id;
    const isStaff =
      actor.role === UserRole.ADMIN || actor.role === UserRole.MODERATOR;
    if (!isOwner && !isStaff) {
      throw new ForbiddenException('Нет прав на этот виджет');
    }
  }

  private toResponse(widget: Widget): WidgetResponseDto {
    return WidgetResponseDto.from(widget);
  }
}

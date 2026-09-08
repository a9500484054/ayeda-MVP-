import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { PublicAuthorDto } from '../../users/dto/public-author.dto';
import { Widget, WidgetStatus } from '../entities/widget.entity';

/**
 * Форма ответа. Строится из entity через plainToInstance в сервисе
 * (см. WidgetsService.toResponse) — руками поля не перекладываем.
 * excludeExtraneousValues: true → в ответ попадёт только то, что помечено @Expose.
 */
@Exclude()
export class WidgetResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiProperty({ nullable: true })
  description: string | null;

  @Expose()
  @ApiProperty({ enum: WidgetStatus })
  status: WidgetStatus;

  @Expose()
  @Type(() => PublicAuthorDto)
  @ApiProperty({ type: PublicAuthorDto })
  owner: PublicAuthorDto;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  static from(widget: Widget): WidgetResponseDto {
    // owner может быть не загружен — подстрахуемся
    return Object.assign(new WidgetResponseDto(), widget, {
      owner: widget.owner ? PublicAuthorDto.fromUser(widget.owner) : null,
    });
  }
}

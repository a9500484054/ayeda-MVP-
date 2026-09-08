import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { UserRole } from '../users/entities/user.entity';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { WidgetResponseDto } from './dto/widget-response.dto';
import { WidgetsQueryDto } from './dto/widgets-query.dto';
import { WidgetStatus } from './entities/widget.entity';
import { WidgetsService } from './widgets.service';

interface AuthedRequest {
  user: { id: string; role: UserRole };
}

@ApiTags('widgets')
@Controller('widgets')
export class WidgetsController {
  constructor(private readonly widgets: WidgetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать виджет' })
  @ApiOkResponse({ type: WidgetResponseDto })
  create(
    @Req() req: AuthedRequest,
    @Body() dto: CreateWidgetDto,
  ): Promise<WidgetResponseDto> {
    return this.widgets.create(req.user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Список виджетов (пагинация + фильтры)' })
  findAll(
    @Query() query: WidgetsQueryDto,
  ): Promise<PaginatedResponseDto<WidgetResponseDto>> {
    return this.widgets.findAll(query);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Виджет по id' })
  @ApiOkResponse({ type: WidgetResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WidgetResponseDto> {
    return this.widgets.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить виджет (владелец или admin/moderator)' })
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWidgetDto,
  ): Promise<WidgetResponseDto> {
    return this.widgets.update(req.user, id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сменить статус виджета' })
  setStatus(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: WidgetStatus,
  ): Promise<WidgetResponseDto> {
    return this.widgets.setStatus(req.user, id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить виджет (soft delete)' })
  remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.widgets.remove(req.user, id);
  }
}

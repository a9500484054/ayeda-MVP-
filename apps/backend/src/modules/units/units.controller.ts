import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitResponseDto } from './dto/unit-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';

@ApiTags('units')
@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Создать единицу измерения (только admin)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UnitResponseDto })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Код уже существует',
  })
  create(@Body() createUnitDto: CreateUnitDto): Promise<UnitResponseDto> {
    return this.unitsService.create(createUnitDto);
  }

  // @Get()
  // @ApiOperation({ summary: 'Получить список всех единиц измерения' })
  // @ApiResponse({ status: HttpStatus.OK, type: [UnitResponseDto] })
  // findAll(): Promise<UnitResponseDto[]> {
  //   return this.unitsService.findAll();
  // }
  @Get()
  @ApiOperation({
    summary: 'Получить список всех единиц измерения (с пагинацией)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<UnitResponseDto>,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UnitResponseDto>> {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;

    const [units, total] = await this.unitsService.findAllWithPagination(
      page,
      limit,
    );

    return new PaginatedResponseDto(units, total, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить единицу измерения по ID' })
  @ApiParam({ name: 'id', description: 'UUID единицы измерения' })
  @ApiResponse({ status: HttpStatus.OK, type: UnitResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Не найдена' })
  findOne(@Param('id') id: string): Promise<UnitResponseDto> {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Обновить единицу измерения (только admin)' })
  @ApiParam({ name: 'id', description: 'UUID единицы измерения' })
  @ApiResponse({ status: HttpStatus.OK, type: UnitResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Не найдена' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Код уже существует',
  })
  update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ): Promise<UnitResponseDto> {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить единицу измерения (только admin)' })
  @ApiParam({ name: 'id', description: 'UUID единицы измерения' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Удалено' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Не найдена' })
  remove(@Param('id') id: string): Promise<void> {
    return this.unitsService.remove(id);
  }
}

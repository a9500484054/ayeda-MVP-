import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VkusvillService } from './vkusvill.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('vkusvill')
@Controller('vkusvill')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VkusvillController {
  constructor(private readonly vkusvillService: VkusvillService) {}

  @Post('cart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Собрать корзину во ВкусВилл из списка ингредиентов',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        cartUrl: 'https://vkusvill.ru/?share_basket=abc123',
        matched: [
          {
            name: 'Творог 5%',
            xml_id: 12345,
            rating: 4.9,
            price: 89,
            unit: 'шт',
            weight: 200,
            query: 'Творог',
          },
        ],
        skipped: ['Агавовый сироп'],
      },
    },
  })
  async createCart(@Body() dto: CreateCartDto) {
    return this.vkusvillService.createCart(dto);
  }
}

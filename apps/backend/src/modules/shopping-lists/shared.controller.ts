import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ShoppingListsService } from './shopping-lists.service';
import { ShoppingListResponseDto } from './dto/responses/shopping-list-response.dto';

@ApiTags('shared')
@Controller('shared')
export class SharedController {
  constructor(private readonly shoppingListsService: ShoppingListsService) {}

  @Get(':token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Публичный доступ к списку покупок по share token' })
  @ApiParam({ name: 'token', description: 'Share token списка' })
  @ApiResponse({ status: HttpStatus.OK, type: ShoppingListResponseDto })
  async getListByToken(
    @Param('token') token: string,
  ): Promise<ShoppingListResponseDto> {
    return this.shoppingListsService.findByShareToken(token);
  }
}

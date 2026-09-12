import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VkusvillMcpClient } from './vkusvill-mcp.client';
import { CreateCartDto, CartItemDto } from './dto/create-cart.dto';

interface VkusvillProduct {
  id?: string | number;
  xml_id?: number;
  name?: string;
  rating?: { average?: number; count?: number } | number;
  price?: { current?: number; regular?: number; value?: number } | number;
  unit?: string;
  weight?: number;
}

export interface VkusvillMatchedItem {
  name: string;
  xml_id: number;
  rating?: number;
  price?: number;
  unit?: string;
  weight?: number;
  query: string;
}

export interface VkusvillCartResult {
  cartUrl: string;
  matched: VkusvillMatchedItem[];
  skipped: string[];
}

const DEFAULT_MCP_URL = 'https://mcp001.vkusvill.ru/mcp';

@Injectable()
export class VkusvillService {
  private readonly logger = new Logger(VkusvillService.name);
  private readonly mcpUrl: string;
  private client: VkusvillMcpClient;

  constructor(private readonly config: ConfigService) {
    this.mcpUrl = this.config.get<string>('VKUSVILL_MCP_URL', DEFAULT_MCP_URL);
    this.client = new VkusvillMcpClient(this.mcpUrl);
  }

  async createCart(dto: CreateCartDto): Promise<VkusvillCartResult> {
    const minRating = dto.minRating ?? 4.7;
    const items = dto.items;

    if (!items?.length) {
      throw new BadRequestException('Список ингредиентов пуст');
    }

    if (items.length > 20) {
      throw new BadRequestException(
        'ВкусВилл принимает максимум 20 позиций в одной корзине',
      );
    }

    await this.client.initialize();

    const matched: VkusvillMatchedItem[] = [];
    const skipped: string[] = [];
    const products: Array<{ xml_id: number; q: number }> = [];

    for (const item of items) {
      try {
        const found = await this.searchProduct(item, minRating);

        if (!found || !found.xml_id) {
          this.logger.warn(`Не найден товар: ${item.name}`);
          skipped.push(item.name);
          continue;
        }

        const q = this.normalizeQuantity(item.quantity ?? 1);
        products.push({ xml_id: found.xml_id, q });

        matched.push({
          name: found.name ?? item.name,
          xml_id: found.xml_id,
          rating: this.extractRating(found.rating),
          price: this.extractPrice(found.price),
          unit: found.unit,
          weight: found.weight,
          query: item.name,
        });

        this.logger.log(
          `Найден: "${item.name}" → "${found.name}" (xml_id=${found.xml_id}, rating=${this.extractRating(found.rating)}, price=${this.extractPrice(found.price)})`,
        );
      } catch (err) {
        this.logger.error(
          `Ошибка поиска "${item.name}": ${(err as Error).message}`,
        );
        skipped.push(item.name);
      }
    }

    if (!products.length) {
      throw new BadRequestException(
        'Не удалось подобрать ни одного товара с подходящим рейтингом',
      );
    }

    const cartUrl = await this.createCartLink(products);
    this.logger.log(`Корзина создана: ${cartUrl}`);

    return { cartUrl, matched, skipped };
  }

  private async searchProduct(
    item: CartItemDto,
    minRating: number,
  ): Promise<VkusvillProduct | null> {
    const args = {
      q: item.name,
      page: 1,
      sort: 'rating' as const,
      mode: 'full' as const,
    };

    this.logger.debug(`Поиск: "${item.name}" args=${JSON.stringify(args)}`);

    const text = await this.client.callTool('vkusvill_products_search', args);

    this.logger.debug(`Ответ search "${item.name}": ${text.slice(0, 1500)}`);

    const products = this.parseProductsFromText(text);
    this.logger.debug(`Распарсено товаров: ${products.length}`);

    if (!products.length) return null;

    // Сначала фильтр по релевантности, потом по рейтингу
    const relevant = products.filter((p) =>
      this.isRelevant(p.name ?? '', item.name),
    );
    this.logger.debug(`Релевантных: ${relevant.length}`);

    const suitable = relevant
      .filter((p) => this.extractRating(p.rating) >= minRating)
      .sort(
        (a, b) => this.extractRating(b.rating) - this.extractRating(a.rating),
      );

    this.logger.debug(
      `После фильтра (minRating=${minRating}): ${suitable.length}`,
    );

    if (!suitable.length && relevant.length) {
      // Если релевантные есть, но рейтинг низкий — берём лучшего из релевантных
      const fallback = relevant.sort(
        (a, b) => this.extractRating(b.rating) - this.extractRating(a.rating),
      )[0];
      this.logger.warn(
        `Рейтинг ниже ${minRating}, беру лучший релевантный: "${fallback.name}" (rating=${this.extractRating(fallback.rating)})`,
      );
      return fallback;
    }

    if (suitable.length) {
      this.logger.debug(`Первый: ${JSON.stringify(suitable[0])}`);
    }

    return suitable[0] ?? null;
  }

  /**
   * Простая проверка релевантности: хотя бы одно значимое слово из запроса
   * должно встречаться в названии товара (или наоборот).
   */
  private isRelevant(productName: string, query: string): boolean {
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const nameWords = normalize(productName).split(' ').filter(Boolean);
    const queryWords = normalize(query)
      .split(' ')
      .filter((w) => w.length >= 4);

    if (!queryWords.length) return true; // слишком короткий запрос — не фильтруем

    return queryWords.some((qw) =>
      nameWords.some((nw) => {
        // Сравниваем по первым 5 символам — устойчиво к падежам
        const q = qw.slice(0, 5);
        const n = nw.slice(0, 5);
        return n.startsWith(q) || q.startsWith(n);
      }),
    );
  }

  private async createCartLink(
    products: Array<{ xml_id: number; q: number }>,
  ): Promise<string> {
    this.logger.debug(`Создание корзины, products=${JSON.stringify(products)}`);

    const text = await this.client.callTool('vkusvill_cart_link_create', {
      products,
    });

    this.logger.debug(`Ответ cart_link_create: ${text.slice(0, 1000)}`);

    if (!text) {
      throw new InternalServerErrorException(
        'MCP-сервер вернул пустой ответ при создании корзины',
      );
    }

    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && parsed.ok === false) {
        const msg =
          parsed.error?.message || parsed.error?.code || 'неизвестная ошибка';
        throw new InternalServerErrorException(`ВкусВилл: ${msg}`);
      }
    } catch (e) {
      if (e instanceof InternalServerErrorException) throw e;
    }

    const urlMatch = text.match(/https?:\/\/[^\s"']+/);
    if (!urlMatch) {
      throw new InternalServerErrorException(
        'MCP-сервер не вернул ссылку на корзину',
      );
    }

    return urlMatch[0];
  }

  // ==================== ПАРСИНГ ====================

  private parseProductsFromText(text: string): VkusvillProduct[] {
    if (!text) return [];

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          return [];
        }
      } else {
        return [];
      }
    }

    if (parsed && typeof parsed === 'object' && 'ok' in parsed) {
      if (parsed.ok === false) {
        const errMsg =
          parsed.error?.message || parsed.error?.code || 'MCP вернул ошибку';
        throw new BadRequestException(`ВкусВилл: ${errMsg}`);
      }

      const data = parsed.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.products)) return data.products;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.results)) return data.results;
      return [];
    }

    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.products)) return parsed.products;
    if (Array.isArray(parsed.data)) return parsed.data;
    if (Array.isArray(parsed.items)) return parsed.items;

    return [];
  }

  private extractRating(rating: VkusvillProduct['rating']): number {
    if (typeof rating === 'number') return rating;
    if (typeof rating === 'object' && rating?.average) return rating.average;
    return 0;
  }

  private extractPrice(price: VkusvillProduct['price']): number | undefined {
    if (typeof price === 'number') return price;
    if (typeof price === 'object' && price) {
      if (typeof price.current === 'number') return price.current;
      if (typeof price.regular === 'number') return price.regular;
      if (typeof price.value === 'number') return price.value;
    }
    return undefined;
  }

  private normalizeQuantity(q: number): number {
    const clamped = Math.min(40, Math.max(0.01, q));
    return Math.round(clamped * 100) / 100;
  }
}

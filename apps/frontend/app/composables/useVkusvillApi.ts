// apps/frontend/app/composables/useVkusvillApi.ts
import type { ShoppingItem } from '~/shared/types/shopping.types'

export function useVkusvillApi() {
  const toast = useToast()

  /**
   * Формирует промпт для ИИ-помощника с подключённым MCP ВкусВилл.
   */
  function buildVkusvillPrompt(
    items: Array<{ name: string; quantity: number; unit: string }>,
    minRating = 4.7
  ): string {
    const list = items
      .map(i => `- ${i.name} — ${formatQty(i.quantity)} ${i.unit}`)
      .join('\n')

    return [
      `Собери корзину во ВкусВилл (рейтинг товаров не ниже ${minRating}).`,
      `Найди товары через vkusvill_products_search, отфильтруй по рейтингу и создай корзину через vkusvill_cart_link_create.`,
      ``,
      `Список:`,
      list,
      ``,
      `Пришли ссылку на корзину.`
    ].join('\n')
  }

  function formatQty(q: number): string {
    return Number.isInteger(q) ? String(q) : q.toFixed(2).replace('.', ',')
  }

  /**
   * Копирует промпт в буфер обмена и показывает тост.
   */
  async function copyVkusvillPrompt(
    items: Array<{ name: string; quantity: number; unit: string }>,
    options?: { minRating?: number; silent?: boolean }
  ): Promise<string> {
    const prompt = buildVkusvillPrompt(items, options?.minRating ?? 4.7)

    try {
      await navigator.clipboard.writeText(prompt)

      if (!options?.silent) {
        toast.add({
          title: 'Промпт скопирован',
          description:
            'Вставьте его в ИИ-помощник с подключённым MCP ВкусВилл (Claude Desktop, Cursor и др.)',
          color: 'success'
        })
      }

      return prompt
    } catch (err) {
      console.error('Ошибка копирования промпта:', err)
      toast.add({
        title: 'Не удалось скопировать',
        description: 'Скопируйте текст вручную из модального окна',
        color: 'error'
      })
      return prompt
    }
  }

  return {
    buildVkusvillPrompt,
    copyVkusvillPrompt
  }
}

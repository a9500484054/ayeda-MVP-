/**
 * Форматирование даты
 * @param date - дата (Date, строка, timestamp)
 * @param format - формат (по умолчанию 'DD.MM.YYYY')
 * @returns отформатированная дата
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  format: string = 'DD.MM.YYYY'
): string {
  if (!date) return ''

  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const year = d.getFullYear().toString()
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * Относительная дата (сегодня, вчера, N дней назад)
 * @param date - дата
 * @returns строка с относительной датой
 */
export function getRelativeDate(date: Date | string | number): string {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) return `${diffDays} дня назад`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} недели назад`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} месяца назад`
  return `${Math.floor(diffDays / 365)} года назад`
}

/**
 * Форматирование времени
 * @param minutes - количество минут
 * @returns отформатированное время (например, "1 ч 30 мин")
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours} ч`
  return `${hours} ч ${mins} мин`
}

/**
 * Проверка на сегодняшнюю дату
 * @param date - дата
 * @returns true если сегодня
 */
export function isToday(date: Date | string | number): boolean {
  const d = new Date(date)
  const today = new Date()
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
}

/**
 * Проверка на вчерашнюю дату
 * @param date - дата
 * @returns true если вчера
 */
export function isYesterday(date: Date | string | number): boolean {
  const d = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
}

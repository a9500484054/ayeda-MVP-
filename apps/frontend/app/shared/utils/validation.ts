/**
 * Валидация email
 * @param email - email для проверки
 * @returns true если email валидный
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Валидация телефона (российские номера)
 * @param phone - телефон для проверки
 * @returns true если телефон валидный
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
  return phoneRegex.test(phone)
}

/**
 * Валидация URL
 * @param url - URL для проверки
 * @returns true если URL валидный
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Валидация пароля (минимум 6 символов)
 * @param password - пароль
 * @returns true если пароль валидный
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

/**
 * Валидация числа в диапазоне
 * @param value - число
 * @param min - минимум
 * @param max - максимум
 * @returns true если в диапазоне
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Валидация длины строки
 * @param value - строка
 * @param min - минимум
 * @param max - максимум
 * @returns true если длина в диапазоне
 */
export function isValidLength(value: string, min: number, max: number): boolean {
  const length = value?.length || 0
  return length >= min && length <= max
}

/**
 * Проверка на пустое значение
 * @param value - значение
 * @returns true если пустое
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Валидация целого числа
 * @param value - значение
 * @returns true если целое число
 */
export function isInteger(value: unknown): boolean {
  return Number.isInteger(Number(value))
}

/**
 * Валидация положительного числа
 * @param value - значение
 * @returns true если положительное число
 */
export function isPositiveNumber(value: unknown): boolean {
  const num = Number(value)
  return !isNaN(num) && num > 0
}

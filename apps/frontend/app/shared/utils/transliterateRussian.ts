/**
 * Транслитерация русских символов в латиницу (ГОСТ 7.79-2000)
 * @param text - текст для транслитерации
 * @returns транслитерированный текст
 */
export default function transliterateRussian(text: string): string {
  if (!text) return '';

  const ruToEn: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shh',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shh',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };

  let result = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (ruToEn[char]) {
      result += ruToEn[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      // латиницу и цифры оставляем как есть
      result += char;
    } else if (char === ' ') {
      result += '-';
    } else if (/[^\w\-]/.test(char)) {
      // другие символы заменяем на дефис
      result += '-';
    } else {
      result += char;
    }
  }

  // Заменяем несколько дефисов подряд на один
  result = result.replace(/-+/g, '-');

  // Удаляем дефисы в начале и конце
  result = result.replace(/^-|-$/g, '');

  return result;
}

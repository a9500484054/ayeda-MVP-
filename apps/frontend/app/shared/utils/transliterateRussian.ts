/**
 * Транслитерация русского текста в URL slug
 * Пример:
 * "Название страницы" -> "nazvanie-stranicy"
 */
export default function transliterateRussian(text: string): string {
  if (!text) return '';

  const ruToEn: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'shh',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',

    А: 'A',
    Б: 'B',
    В: 'V',
    Г: 'G',
    Д: 'D',
    Е: 'E',
    Ё: 'Yo',
    Ж: 'Zh',
    З: 'Z',
    И: 'I',
    Й: 'Y',
    К: 'K',
    Л: 'L',
    М: 'M',
    Н: 'N',
    О: 'O',
    П: 'P',
    Р: 'R',
    С: 'S',
    Т: 'T',
    У: 'U',
    Ф: 'F',
    Х: 'H',
    Ц: 'C',
    Ч: 'Ch',
    Ш: 'Sh',
    Щ: 'Shh',
    Ъ: '',
    Ы: 'Y',
    Ь: '',
    Э: 'E',
    Ю: 'Yu',
    Я: 'Ya',
  };

  let result = '';

  for (const char of text) {
    if (char in ruToEn) {
      result += ruToEn[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      // латиницу и цифры оставляем
      result += char;
    } else {
      // пробелы и спецсимволы заменяем на дефис
      result += '-';
    }
  }

  return result
    .toLowerCase()
    .replace(/-+/g, '-') // несколько дефисов подряд -> один
    .replace(/^-+|-+$/g, ''); // убрать дефисы по краям
}

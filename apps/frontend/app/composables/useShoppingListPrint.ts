import type { ShoppingList } from '~/shared/types/shopping.types';

export function useShoppingListPrint() {
  function generatePrintHtml(list: ShoppingList): string {
    const date = new Date().toLocaleDateString('ru-RU');
    const items = list.items || [];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${list.title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .date {
            color: #666;
            margin-bottom: 24px;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          .checked {
            text-decoration: line-through;
            color: #999;
          }
          .category {
            font-size: 12px;
            color: #666;
          }
          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>${list.title}</h1>
        <div class="date">Создан: ${date}</div>

        <table>
          <thead>
            <tr>
              <th>Статус</th>
              <th>Продукт</th>
              <th>Количество</th>
              <th>Категория</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.isChecked ? '✓' : '○'}</td>
                <td class="${item.isChecked ? 'checked' : ''}">${item.name}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td class="category">${item.category?.name || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Сгенерировано в Ayeda — Кулинарное пространство
        </div>
      </body>
      </html>
    `;
  }

  function print(list: ShoppingList) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Не удалось открыть окно печати. Разрешите всплывающие окна.');
      return;
    }

    printWindow.document.write(generatePrintHtml(list));
    printWindow.document.close();
    printWindow.print();
  }

  function downloadPDF(list: ShoppingList) {
    // Простой вариант — открыть печать, пользователь сам выберет "Сохранить как PDF"
    print(list);
  }

  return {
    print,
    downloadPDF,
  };
}

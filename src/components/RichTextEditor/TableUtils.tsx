
import React, { useEffect } from 'react';

interface TableUtilsProps {
  onContentChange: () => void;
}

const TableUtils: React.FC<TableUtilsProps> = ({ onContentChange }) => {
  useEffect(() => {
    const addTableRow = (button: HTMLButtonElement) => {
      const td = button.closest('td');
      const tr = td?.closest('tr');
      const table = tr?.closest('table');
      if (tr && table) {
        const newRow = tr.cloneNode(true) as HTMLElement;
        const cells = newRow.querySelectorAll('td');
        cells.forEach((cell, index) => {
          const div = cell.querySelector('div');
          if (div) div.textContent = `Новая ячейка ${index + 1}`;
        });
        tr.parentNode?.insertBefore(newRow, tr.nextSibling);
        onContentChange();
      }
    };

    const addTableCol = (button: HTMLButtonElement) => {
      const td = button.closest('td');
      const table = td?.closest('table');
      if (table) {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, rowIndex) => {
          const newCell = document.createElement('td');
          newCell.style.cssText = 'padding: 8px; border: 1px solid #ddd; min-width: 100px; position: relative;';
          newCell.innerHTML = `<div style="min-height: 20px;">Новая ${rowIndex + 1}</div>
            <div style="position: absolute; top: 2px; right: 2px; display: flex; gap: 1px; opacity: 0.7;" class="table-controls">
              <button onclick="addTableRow(this)" style="font-size: 10px; padding: 1px 3px; background: #007bff; color: white; border: none; border-radius: 2px; cursor: pointer;" title="Добавить строку">+Р</button>
              <button onclick="addTableCol(this)" style="font-size: 10px; padding: 1px 3px; background: #28a745; color: white; border: none; border-radius: 2px; cursor: pointer;" title="Добавить столбец">+С</button>
              <button onclick="removeTableRow(this)" style="font-size: 10px; padding: 1px 3px; background: #dc3545; color: white; border: none; border-radius: 2px; cursor: pointer;" title="Удалить строку">-Р</button>
              <button onclick="removeTableCol(this)" style="font-size: 10px; padding: 1px 3px; background: #6c757d; color: white; border: none; border-radius: 2px; cursor: pointer;" title="Удалить столбец">-С</button>
            </div>`;
          row.appendChild(newCell);
        });
        onContentChange();
      }
    };

    const removeTableRow = (button: HTMLButtonElement) => {
      const tr = button.closest('tr');
      const table = tr?.closest('table');
      if (tr && table && table.querySelectorAll('tr').length > 1) {
        tr.remove();
        onContentChange();
      }
    };

    const removeTableCol = (button: HTMLButtonElement) => {
      const td = button.closest('td');
      const table = td?.closest('table');
      if (td && table) {
        const cellIndex = Array.from(td.parentNode?.children || []).indexOf(td);
        const rows = table.querySelectorAll('tr');
        if (rows[0] && rows[0].children.length > 1) {
          rows.forEach(row => {
            if (row.children[cellIndex]) {
              row.children[cellIndex].remove();
            }
          });
          onContentChange();
        }
      }
    };

    // Добавляем глобальные функции для работы с таблицами
    (window as any).addTableRow = addTableRow;
    (window as any).addTableCol = addTableCol;
    (window as any).removeTableRow = removeTableRow;
    (window as any).removeTableCol = removeTableCol;

    return () => {
      // Очистка глобальных функций при размонтировании
      delete (window as any).addTableRow;
      delete (window as any).addTableCol;
      delete (window as any).removeTableRow;
      delete (window as any).removeTableCol;
    };
  }, [onContentChange]);

  return null;
};

export default TableUtils;

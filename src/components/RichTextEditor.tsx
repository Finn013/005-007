import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Upload, 
  FileText, 
  FileCode,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Table,
  Type,
  Plus,
  Minus
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import TableDialog from './TableDialog';
import LinkDialog from './LinkDialog';

interface RichTextEditorProps {
  content: string;
  onChange: (htmlContent: string, plainText: string) => void;
  onExportHTML: () => void;
  onExportTXT: () => void;
  onImport: (file: File) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onExportHTML,
  onExportTXT,
  onImport
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const currentContentRef = useRef<string>(content);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Диалоги
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  // Устанавливаем содержимое при изменении пропа content
  useEffect(() => {
    if (editorRef.current && content !== currentContentRef.current) {
      editorRef.current.innerHTML = content;
      currentContentRef.current = content;
    }
  }, [content]);

  // Дебаунсированное сохранение
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (currentContentRef.current !== content) {
        // Сохраняем позицию курсора
        const selection = window.getSelection();
        let range: Range | null = null;
        let startOffset = 0;
        let endOffset = 0;
        let startContainer: Node | null = null;
        let endContainer: Node | null = null;

        if (selection && selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
          startContainer = range.startContainer;
          endContainer = range.endContainer;
          startOffset = range.startOffset;
          endOffset = range.endOffset;
        }

        // Обновляем состояние
        onChange(currentContentRef.current, editorRef.current?.textContent || '');
        setLastSavedAt(new Date());

        // Восстанавливаем позицию курсора после небольшой задержки
        setTimeout(() => {
          if (range && startContainer && endContainer && editorRef.current) {
            try {
              const newSelection = window.getSelection();
              const newRange = document.createRange();
              
              // Проверяем, что контейнеры все еще в DOM
              if (editorRef.current.contains(startContainer) && 
                  editorRef.current.contains(endContainer)) {
                newRange.setStart(startContainer, Math.min(startOffset, startContainer.textContent?.length || 0));
                newRange.setEnd(endContainer, Math.min(endOffset, endContainer.textContent?.length || 0));
                
                newSelection?.removeAllRanges();
                newSelection?.addRange(newRange);
              }
            } catch (error) {
              console.log('Курсор не удалось восстановить:', error);
            }
          }
        }, 10);
      }
    }, 500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [currentContentRef.current, content, onChange]);

  const handleInput = () => {
    if (editorRef.current) {
      currentContentRef.current = editorRef.current.innerHTML;
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const imageHTML = `<img src="${imageUrl}" alt="Загруженное изображение" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
        execCommand('insertHTML', imageHTML);
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      currentContentRef.current = editorRef.current.innerHTML;
    }
  };

  const insertTable = (rows: number, cols: number) => {
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0; table-layout: fixed;">';
    
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += `<td style="padding: 8px; border: 1px solid #ddd; min-width: 100px; position: relative;">
          <div style="min-height: 20px;">Ячейка ${i + 1}-${j + 1}</div>
          <div style="position: absolute; top: 2px; right: 2px; display: flex; gap: 1px; opacity: 0.7;" class="table-controls">
            <button onclick="addTableRow(this)" style="font-size: 10px; padding: 1px 3px; background: #007bff; color: white; border: none; border-radius: 2px; cursor: pointer;" title="Добавить строку">+Р</button>
            <button onclick="addTableCol(this)" style="font-size: 10px; padding: 1px 3px; background: #28a745; color: white; border: none; border-radius: 2px; cursor: pointer;" title="Добавить столбец">+С</button>
            <button onclick="removeTableRow(this)" style="font-size: 10px; padding: 1px 3px; background: #dc3545; color: white; border: none; border-radius: 2px; cursor: pointer;" title="Удалить строку">-Р</button>
            <button onclick="removeTableCol(this)" style="font-size: 10px; padding: 1px 3px; background: #6c757d; color: white; border: none; border-radius: 2px; cursor: pointer;" title="Удалить столбец">-С</button>
          </div>
        </td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table><br>';
    
    execCommand('insertHTML', tableHTML);
  };

  const insertLink = (url: string, text: string) => {
    const linkHTML = `<a href="${url}" target="_blank" style="color: #0066cc; text-decoration: underline;">${text}</a>`;
    execCommand('insertHTML', linkHTML);
  };

  const changeFontSize = (size: string) => {
    execCommand('fontSize', size);
  };

  const changeFontColor = (color: string) => {
    execCommand('foreColor', color);
  };

  const changeBackgroundColor = (color: string) => {
    execCommand('backColor', color);
  };

  // Добавляем глобальные функции для работы с таблицами
  useEffect(() => {
    (window as any).addTableRow = (button: HTMLButtonElement) => {
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
        if (editorRef.current) {
          currentContentRef.current = editorRef.current.innerHTML;
        }
      }
    };

    (window as any).addTableCol = (button: HTMLButtonElement) => {
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
        if (editorRef.current) {
          currentContentRef.current = editorRef.current.innerHTML;
        }
      }
    };

    (window as any).removeTableRow = (button: HTMLButtonElement) => {
      const tr = button.closest('tr');
      const table = tr?.closest('table');
      if (tr && table && table.querySelectorAll('tr').length > 1) {
        tr.remove();
        if (editorRef.current) {
          currentContentRef.current = editorRef.current.innerHTML;
        }
      }
    };

    (window as any).removeTableCol = (button: HTMLButtonElement) => {
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
          if (editorRef.current) {
            currentContentRef.current = editorRef.current.innerHTML;
          }
        }
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
        {/* Export/Import buttons */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportHTML}
            className="gap-1"
          >
            <FileCode size={14} />
            HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportTXT}
            className="gap-1"
          >
            <FileText size={14} />
            TXT
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-1"
          >
            <label className="cursor-pointer">
              <Upload size={14} />
              Импорт
              <input
                type="file"
                accept=".html,.txt,.json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </Button>
        </div>

        {/* Text formatting */}
        <ToggleGroup type="multiple" className="gap-1">
          <ToggleGroupItem
            value="bold"
            aria-label="Жирный"
            onClick={() => execCommand('bold')}
            size="sm"
          >
            <Bold size={14} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="italic"
            aria-label="Курсив"
            onClick={() => execCommand('italic')}
            size="sm"
          >
            <Italic size={14} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="underline"
            aria-label="Подчеркнутый"
            onClick={() => execCommand('underline')}
            size="sm"
          >
            <Underline size={14} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="strikethrough"
            aria-label="Зачеркнутый"
            onClick={() => execCommand('strikeThrough')}
            size="sm"
          >
            <Strikethrough size={14} />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="border-r h-8 mx-1"></div>

        {/* Alignment */}
        <ToggleGroup type="single" className="gap-1">
          <ToggleGroupItem
            value="left"
            aria-label="По левому краю"
            onClick={() => execCommand('justifyLeft')}
            size="sm"
          >
            <AlignLeft size={14} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="center"
            aria-label="По центру"
            onClick={() => execCommand('justifyCenter')}
            size="sm"
          >
            <AlignCenter size={14} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="right"
            aria-label="По правому краю"
            onClick={() => execCommand('justifyRight')}
            size="sm"
          >
            <AlignRight size={14} />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="border-r h-8 mx-1"></div>

        {/* Font size */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Type size={14} />
              Размер
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-32">
            <div className="grid gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((size) => (
                <Button
                  key={size}
                  variant="ghost"
                  size="sm"
                  onClick={() => changeFontSize(size.toString())}
                  className="justify-start"
                >
                  {size === 1 && 'Очень мелкий'}
                  {size === 2 && 'Мелкий'}
                  {size === 3 && 'Обычный'}
                  {size === 4 && 'Средний'}
                  {size === 5 && 'Большой'}
                  {size === 6 && 'Очень большой'}
                  {size === 7 && 'Огромный'}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Font color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              🎨 Цвет
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="grid grid-cols-6 gap-1">
              {[
                '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
                '#ff0000', '#ff6600', '#ffcc00', '#00ff00', '#0066ff', '#6600ff',
                '#ff3366', '#ff9933', '#ffff00', '#33ff33', '#3366ff', '#9933ff'
              ].map((color) => (
                <Button
                  key={color}
                  size="sm"
                  className="w-6 h-6 p-0"
                  style={{ backgroundColor: color }}
                  onClick={() => changeFontColor(color)}
                />
              ))}
            </div>
            <div className="mt-2">
              <input
                type="color"
                onChange={(e) => changeFontColor(e.target.value)}
                className="w-full h-8 rounded border"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Background color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              🖍️ Фон
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="grid grid-cols-6 gap-1">
              {[
                '#ffffff', '#ffeeee', '#eeffee', '#eeeeff', '#ffffee', '#ffeeFF',
                '#ffcccc', '#ccffcc', '#ccccff', '#ffffcc', '#ffccff', '#ccffff'
              ].map((color) => (
                <Button
                  key={color}
                  size="sm"
                  className="w-6 h-6 p-0"
                  style={{ backgroundColor: color }}
                  onClick={() => changeBackgroundColor(color)}
                />
              ))}
            </div>
            <div className="mt-2">
              <input
                type="color"
                onChange={(e) => changeBackgroundColor(e.target.value)}
                className="w-full h-8 rounded border"
              />
            </div>
          </PopoverContent>
        </Popover>

        <div className="border-r h-8 mx-1"></div>

        {/* Insert options */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLinkDialogOpen(true)}
          >
            <Link size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <label className="cursor-pointer">
              <Image size={14} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTableDialogOpen(true)}
          >
            <Table size={14} />
          </Button>
        </div>
      </div>

      {/* Rich text editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[400px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        style={{
          lineHeight: '1.6',
          fontSize: '14px'
        }}
      />

      {/* Auto-save indicator */}
      <div className="text-xs text-muted-foreground">
        ✓ Автосохранение • Последнее сохранение: {lastSavedAt.toLocaleTimeString()}
      </div>

      {/* Dialogs */}
      <TableDialog
        open={tableDialogOpen}
        onOpenChange={setTableDialogOpen}
        onInsertTable={insertTable}
      />

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onInsertLink={insertLink}
      />
    </div>
  );
};

export default RichTextEditor;

import React, { useRef, useEffect, useState } from 'react';
import EditorToolbar from './RichTextEditor/EditorToolbar';
import TableDialog from './TableDialog';
import LinkDialog from './LinkDialog';
import TableUtils from './RichTextEditor/TableUtils';

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

  const handleContentChange = () => {
    if (editorRef.current) {
      currentContentRef.current = editorRef.current.innerHTML;
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
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

  return (
    <div className="space-y-4">
      <EditorToolbar
        onExportHTML={onExportHTML}
        onExportTXT={onExportTXT}
        onImport={onImport}
        onFormatText={execCommand}
        onInsertLink={() => setLinkDialogOpen(true)}
        onInsertImage={() => fileInputRef.current?.click()}
        onInsertTable={() => setTableDialogOpen(true)}
      />

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

      {/* Hidden file input for images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Table utilities component */}
      <TableUtils onContentChange={handleContentChange} />

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

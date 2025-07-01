
import React, { useEffect, useRef, useState } from 'react';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import { Button } from '@/components/ui/button';
import { FileText, FileCode, Upload, Save, Link, Image, Table, Type } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

interface MarkdownEditorProps {
  content: string;
  onChange: (htmlContent: string, plainText: string, markdownContent: string) => void;
  onExportHTML: () => void;
  onExportTXT: () => void;
  onImport: (file: File) => void;
  onSave?: () => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  onExportHTML,
  onExportTXT,
  onImport,
  onSave
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorInstanceRef = useRef<EasyMDE | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date>(new Date());
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  useEffect(() => {
    if (textareaRef.current && !editorInstanceRef.current) {
      editorInstanceRef.current = new EasyMDE({
        element: textareaRef.current,
        autoDownloadFontAwesome: false,
        spellChecker: false,
        status: false,
        toolbar: [
          'bold',
          'italic',
          'strikethrough',
          '|',
          'heading-1',
          'heading-2',
          'heading-3',
          '|',
          'quote',
          'unordered-list',
          'ordered-list',
          '|',
          'code',
          'table',
          'horizontal-rule',
          '|',
          'link',
          'image',
          '|',
          'preview',
          'side-by-side',
          'fullscreen'
        ],
        placeholder: 'Начните писать в формате Markdown...',
        initialValue: content,
        renderingConfig: {
          singleLineBreaks: false,
          codeSyntaxHighlighting: true,
        },
      });

      // Обработчик изменений с дебаунсингом
      editorInstanceRef.current.codemirror.on('change', () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
          if (editorInstanceRef.current) {
            const markdownContent = editorInstanceRef.current.value();
            const htmlContent = convertMarkdownToHTML(markdownContent);
            const plainText = markdownContent.replace(/[#*\-_`~\[\]()]/g, '');
            
            onChange(htmlContent, plainText, markdownContent);
            setLastSavedAt(new Date());
          }
        }, 500);
      });
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Простая функция для конвертации markdown в HTML
  const convertMarkdownToHTML = (markdown: string): string => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/!\[([^\]]*)\]\(([^\)]*)\)/gim, '<img alt="$1" src="$2" />')
      .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>')
      .replace(/\n/gim, '<br>');
  };

  useEffect(() => {
    if (editorInstanceRef.current && content !== editorInstanceRef.current.value()) {
      editorInstanceRef.current.value(content);
    }
  }, [content]);

  useEffect(() => {
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.toTextArea();
        editorInstanceRef.current = null;
      }
    };
  }, []);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  };

  const handleExportMarkdown = () => {
    if (editorInstanceRef.current) {
      const markdownContent = editorInstanceRef.current.value();
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.md';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const insertText = (text: string) => {
    if (editorInstanceRef.current) {
      const cm = editorInstanceRef.current.codemirror;
      const cursor = cm.getCursor();
      cm.replaceRange(text, cursor);
      cm.focus();
    }
  };

  const handleInsertLink = () => {
    if (linkText && linkUrl) {
      insertText(`[${linkText}](${linkUrl})`);
      setLinkText('');
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const handleInsertImage = () => {
    if (imageAlt && imageUrl) {
      insertText(`![${imageAlt}](${imageUrl})`);
      setImageAlt('');
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const handleInsertTable = () => {
    let tableMarkdown = '\n';
    
    // Header
    tableMarkdown += '|';
    for (let i = 1; i <= tableCols; i++) {
      tableMarkdown += ` Заголовок ${i} |`;
    }
    tableMarkdown += '\n';
    
    // Separator
    tableMarkdown += '|';
    for (let i = 0; i < tableCols; i++) {
      tableMarkdown += ' --- |';
    }
    tableMarkdown += '\n';
    
    // Rows
    for (let i = 1; i < tableRows; i++) {
      tableMarkdown += '|';
      for (let j = 1; j <= tableCols; j++) {
        tableMarkdown += ` Ячейка ${i}-${j} |`;
      }
      tableMarkdown += '\n';
    }
    
    insertText(tableMarkdown);
    setShowTableDialog(false);
  };

  const changeFontColor = (color: string) => {
    const selectedText = window.getSelection()?.toString() || 'цветной текст';
    insertText(`<span style="color: ${color}">${selectedText}</span>`);
  };

  const changeBackgroundColor = (color: string) => {
    const selectedText = window.getSelection()?.toString() || 'выделенный текст';
    insertText(`<span style="background-color: ${color}">${selectedText}</span>`);
  };

  return (
    <div className="space-y-4">
      {/* Расширенная панель инструментов */}
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
            onClick={handleExportMarkdown}
            className="gap-1"
          >
            📝 MD
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
                accept=".md,.txt,.html"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </Button>
        </div>

        {/* Insert options */}
        <div className="flex gap-1 border-r pr-2 mr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
            className="gap-1"
          >
            <Link size={14} />
            Ссылка
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImageDialog(true)}
            className="gap-1"
          >
            <Image size={14} />
            Изображение
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTableDialog(true)}
            className="gap-1"
          >
            <Table size={14} />
            Таблица
          </Button>
        </div>

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

        {onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="gap-1 ml-auto"
          >
            <Save size={14} />
            Сохранить
          </Button>
        )}
      </div>

      {/* Markdown редактор */}
      <div className="markdown-editor-container">
        <textarea
          ref={textareaRef}
          className="hidden"
        />
      </div>

      {/* Индикатор автосохранения */}
      <div className="text-xs text-muted-foreground">
        ✓ Автосохранение • Последнее сохранение: {lastSavedAt.toLocaleTimeString()}
      </div>

      {/* Диалоги */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вставить ссылку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Текст ссылки</label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Текст для отображения"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInsertLink}>Вставить</Button>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вставить изображение</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Альтернативный текст</label>
              <Input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Описание изображения"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL изображения</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInsertImage}>Вставить</Button>
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать таблицу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Количество строк</label>
              <Input
                type="number"
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                min="2"
                max="10"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Количество столбцов</label>
              <Input
                type="number"
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                min="2"
                max="10"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInsertTable}>Создать</Button>
              <Button variant="outline" onClick={() => setShowTableDialog(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Кастомные стили для EasyMDE */}
      <style>{`
        .markdown-editor-container .EasyMDEContainer {
          border-radius: 8px;
        }
        
        .markdown-editor-container .EasyMDEContainer .CodeMirror {
          min-height: 400px;
          font-size: 14px;
          line-height: 1.6;
          border-radius: 0 0 8px 8px;
        }
        
        .markdown-editor-container .editor-toolbar {
          border-radius: 8px 8px 0 0;
          background: hsl(var(--muted));
        }
        
        .markdown-editor-container .editor-toolbar button {
          border: none !important;
          background: transparent !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .markdown-editor-container .editor-toolbar button:hover {
          background: hsl(var(--accent)) !important;
        }
        
        .markdown-editor-container .editor-toolbar.fullscreen {
          z-index: 1000;
        }
        
        .markdown-editor-container .CodeMirror-fullscreen {
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;

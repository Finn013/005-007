import React, { useEffect, useRef, useState } from 'react';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import { Button } from '@/components/ui/button';
import { FileText, FileCode, Upload, Save, Link, Image, Table, Type, Settings, Plus } from 'lucide-react';
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
  const [showSymbolDialog, setShowSymbolDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [customSymbol, setCustomSymbol] = useState('');
  const [commonSymbols, setCommonSymbols] = useState([
    '★', '☆', '✓', '✗', '✕', '⚠️', '🔥', '💡', '📝', '📋',
    '⭐', '💯', '🎯', '🚀', '⚡', '🔔', '❤️', '👍', '👎', '🎉',
    '→', '←', '↑', '↓', '⇒', '⇐', '↔️', '⇔️', '➡️', '⬅️',
    '•', '◦', '▪', '▫', '■', '□', '●', '○', '♦', '◊'
  ]);

  useEffect(() => {
    if (textareaRef.current && !editorInstanceRef.current) {
      editorInstanceRef.current = new EasyMDE({
        element: textareaRef.current,
        autoDownloadFontAwesome: false,
        spellChecker: false,
        status: ['autosave', 'lines', 'words', 'cursor'],
        toolbar: [
          {
            name: 'undo',
            action: EasyMDE.undo,
            className: 'fa fa-undo no-disable',
            title: 'Отменить',
          },
          {
            name: 'redo',
            action: EasyMDE.redo,
            className: 'fa fa-repeat no-disable',
            title: 'Повторить',
          },
          '|',
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
        shortcuts: {
          drawTable: 'Cmd-Alt-T',
          togglePreview: 'Cmd-P',
          toggleSideBySide: 'F9',
          toggleFullScreen: 'F11'
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

  const insertSymbol = (symbol: string) => {
    insertText(symbol);
  };

  const insertCustomSymbol = () => {
    if (customSymbol.trim()) {
      insertText(customSymbol);
      setCustomSymbol('');
      setShowSymbolDialog(false);
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
    
    tableMarkdown += '|';
    for (let i = 1; i <= tableCols; i++) {
      tableMarkdown += ` Заголовок ${i} |`;
    }
    tableMarkdown += '\n';
    
    tableMarkdown += '|';
    for (let i = 0; i < tableCols; i++) {
      tableMarkdown += ' --- |';
    }
    tableMarkdown += '\n';
    
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
      {/* Объединённая панель инструментов */}
      <div className="flex flex-wrap gap-2 p-4 border-2 border-gray-300 rounded-lg bg-muted/50">
        {/* Export/Import */}
        <div className="flex gap-2 border-r-2 border-gray-300 pr-3 mr-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportHTML}
            className="gap-2 border-2 border-gray-400 hover:border-gray-600"
          >
            <FileCode size={16} />
            HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportTXT}
            className="gap-2 border-2 border-gray-400 hover:border-gray-600"
          >
            <FileText size={16} />
            TXT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMarkdown}
            className="gap-2 border-2 border-gray-400 hover:border-gray-600"
          >
            📝 MD
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 border-2 border-gray-400 hover:border-gray-600"
          >
            <label className="cursor-pointer">
              <Upload size={16} />
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

        {/* Insert Tools */}
        <div className="flex gap-2 border-r-2 border-gray-300 pr-3 mr-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
            className="gap-2 border-2 border-blue-400 hover:border-blue-600"
          >
            <Link size={16} />
            Ссылка
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImageDialog(true)}
            className="gap-2 border-2 border-green-400 hover:border-green-600"
          >
            <Image size={16} />
            Изображение
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTableDialog(true)}
            className="gap-2 border-2 border-purple-400 hover:border-purple-600"
          >
            <Table size={16} />
            Таблица
          </Button>
        </div>

        {/* Symbol Tools */}
        <div className="flex gap-2 border-r-2 border-gray-300 pr-3 mr-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const symbol = prompt('Введите символ для вставки:');
              if (symbol) insertSymbol(symbol);
            }}
            className="gap-2 border-2 border-yellow-400 hover:border-yellow-600"
          >
            <Type size={16} />
            Вставить символ
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-2 border-orange-400 hover:border-orange-600"
              >
                🎨 Символы
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-popover border-2 border-gray-300">
              <div className="grid grid-cols-8 gap-2">
                {commonSymbols.map((symbol) => (
                  <Button
                    key={symbol}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-lg border border-gray-300 hover:border-gray-500"
                    onClick={() => insertSymbol(symbol)}
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Color Tools */}
        <div className="flex gap-2 border-r-2 border-gray-300 pr-3 mr-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-2 border-red-400 hover:border-red-600"
              >
                🎭 Цвет текста
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-popover border-2 border-gray-300">
              <div className="grid grid-cols-6 gap-1">
                {[
                  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
                  '#ff0000', '#ff6600', '#ffcc00', '#00ff00', '#0066ff', '#6600ff',
                  '#ff3366', '#ff9933', '#ffff00', '#33ff33', '#3366ff', '#9933ff'
                ].map((color) => (
                  <Button
                    key={color}
                    size="sm"
                    className="w-6 h-6 p-0 border border-gray-400"
                    style={{ backgroundColor: color }}
                    onClick={() => changeFontColor(color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-2 border-pink-400 hover:border-pink-600"
              >
                🖍️ Фон текста
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-popover border-2 border-gray-300">
              <div className="grid grid-cols-6 gap-1">
                {[
                  '#ffffff', '#ffeeee', '#eeffee', '#eeeeff', '#ffffee', '#ffeeFF',
                  '#ffcccc', '#ccffcc', '#ccccff', '#ffffcc', '#ffccff', '#ccffff'
                ].map((color) => (
                  <Button
                    key={color}
                    size="sm"
                    className="w-6 h-6 p-0 border border-gray-400"
                    style={{ backgroundColor: color }}
                    onClick={() => changeBackgroundColor(color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Settings and Save */}
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettingsDialog(true)}
            className="gap-2 border-2 border-gray-500 hover:border-gray-700"
          >
            <Settings size={16} />
            Настройки
          </Button>
          
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              className="gap-2 border-2 border-green-500 hover:border-green-700"
            >
              <Save size={16} />
              Сохранить
            </Button>
          )}
        </div>
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
        <DialogContent className="bg-popover border-2 border-gray-400">
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
                className="border-2 border-gray-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                type="url"
                className="border-2 border-gray-300"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInsertLink} className="border-2 border-blue-500">Вставить</Button>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)} className="border-2 border-gray-400">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-popover border-2 border-gray-400">
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
                className="border-2 border-gray-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL изображения</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
                className="border-2 border-gray-300"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInsertImage} className="border-2 border-green-500">Вставить</Button>
              <Button variant="outline" onClick={() => setShowImageDialog(false)} className="border-2 border-gray-400">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="bg-popover border-2 border-gray-400">
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
                className="border-2 border-gray-300"
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
                className="border-2 border-gray-300"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInsertTable} className="border-2 border-purple-500">Создать</Button>
              <Button variant="outline" onClick={() => setShowTableDialog(false)} className="border-2 border-gray-400">
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-popover border-2 border-gray-400">
          <DialogHeader>
            <DialogTitle>Настройки редактора</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Горячие клавиши:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• Ctrl+B - Жирный текст</div>
                <div>• Ctrl+I - Курсив</div>
                <div>• Ctrl+K - Ссылка</div>
                <div>• Ctrl+Alt+T - Таблица</div>
                <div>• Ctrl+P - Предпросмотр</div>
                <div>• F9 - Режим бок о бок</div>
                <div>• F11 - Полноэкранный режим</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Информация:</h4>
              <div className="text-sm text-muted-foreground">
                <div>Версия редактора: EasyMDE 2.20.0</div>
                <div>Поддержка Markdown: Полная</div>
                <div>Автосохранение: Включено</div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)} className="border-2 border-gray-400">
                Закрыть
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Кастомные стили для EasyMDE */}
      <style>{`
        .markdown-editor-container .EasyMDEContainer {
          border-radius: 8px;
          border: 2px solid hsl(var(--border));
        }
        
        .markdown-editor-container .EasyMDEContainer .CodeMirror {
          min-height: 400px;
          font-size: 14px;
          line-height: 1.6;
          border-radius: 0 0 8px 8px;
          border: none;
        }
        
        .markdown-editor-container .editor-toolbar {
          border-radius: 8px 8px 0 0;
          background: hsl(var(--muted));
          border: none;
          border-bottom: 2px solid hsl(var(--border));
        }
        
        .markdown-editor-container .editor-toolbar button {
          border: 2px solid transparent !important;
          background: transparent !important;
          color: hsl(var(--foreground)) !important;
          border-radius: 4px !important;
          margin: 2px !important;
          font-weight: bold !important;
        }
        
        .markdown-editor-container .editor-toolbar button:hover {
          background: hsl(var(--accent)) !important;
          border-color: hsl(var(--border)) !important;
        }
        
        .markdown-editor-container .editor-toolbar button.active {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          border-color: hsl(var(--primary)) !important;
        }
        
        .markdown-editor-container .editor-toolbar.fullscreen {
          z-index: 1000;
        }
        
        .markdown-editor-container .CodeMirror-fullscreen {
          z-index: 1000;
        }
        
        .markdown-editor-container .editor-statusbar {
          border-top: 2px solid hsl(var(--border));
          background: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;

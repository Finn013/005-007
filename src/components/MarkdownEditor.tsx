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
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [customSymbol, setCustomSymbol] = useState('');
  const [commonSymbols] = useState([
    '★', '☆', '✓', '✗', '✕', '⚠️', '🔥', '💡', '📝', '📋',
    '⭐', '💯', '🎯', '🚀', '⚡', '🔔', '❤️', '👍', '👎', '🎉',
    '→', '←', '↑', '↓', '⇒', '⇐', '↔️', '⇔️', '➡️', '⬅️',
    '•', '◦', '▪', '▫', '■', '□', '●', '○', '♦', '◊'
  ]);

  // Продвинутый конвертер markdown в HTML с поддержкой inline-стилей
  const convertMarkdownToHTML = (markdown: string): string => {
    let html = markdown
      // Заголовки
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Форматирование текста
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      
      // Ссылки и изображения
      .replace(/!\[([^\]]*)\]\(([^\)]*)\)/gim, '<img alt="$1" src="$2" style="max-width: 100%; height: auto;" />')
      .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Списки
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      
      // Цитаты
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      
      // Горизонтальная линия
      .replace(/^---$/gim, '<hr>')
      
      // Таблицы (базовая поддержка)
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(cell => cell.trim()).map(cell => cell.trim());
        return '<tr>' + cells.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
      })
      
      // Переводы строк
      .replace(/\n/gim, '<br>');

    // Обработка HTML-тегов с inline-стилями (оставляем как есть)
    html = html.replace(/<span[^>]*style[^>]*>.*?<\/span>/gim, (match) => match);
    
    // Обертка для списков
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul><br><ul>/gim, '');
    
    return html;
  };

  useEffect(() => {
    if (textareaRef.current && !editorInstanceRef.current) {
      editorInstanceRef.current = new EasyMDE({
        element: textareaRef.current,
        autoDownloadFontAwesome: true,
        spellChecker: false,
        status: ['autosave', 'lines', 'words', 'cursor'],
        toolbar: [
          // Отмена/повтор
          'undo', 'redo', '|',
          // Форматирование
          'bold', 'italic', 'strikethrough', '|',
          // Заголовки
          'heading-1', 'heading-2', 'heading-3', '|',
          // Списки и цитаты
          'quote', 'unordered-list', 'ordered-list', '|',
          // Код и таблицы
          'code', 'table', 'horizontal-rule', '|',
          // Ссылки и изображения
          'link', 'image', '|',
          // Просмотр
          'preview', 'side-by-side', 'fullscreen'
        ],
        placeholder: 'Начните писать в формате Markdown...',
        initialValue: content,
        renderingConfig: {
          singleLineBreaks: false,
          codeSyntaxHighlighting: true,
        },
        previewRender: (plainText: string) => {
          return convertMarkdownToHTML(plainText);
        },
        shortcuts: {
          drawTable: 'Cmd-Alt-T',
          togglePreview: 'Cmd-P',
          toggleSideBySide: 'F9',
          toggleFullScreen: 'F11'
        },
        theme: 'default',
        styleSelectedText: true,
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
    }
  };

  return (
    <div className="space-y-4">
      {/* Объединённая панель инструментов */}
      <div className="flex flex-wrap gap-2 p-4 border-3 border-purple-300 rounded-lg bg-purple-50/30">
        {/* Export/Import */}
        <div className="flex gap-2 border-r-2 border-purple-300 pr-3 mr-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportHTML}
            className="gap-2 border-2 border-purple-400 hover:border-purple-600 text-purple-700 hover:text-purple-900"
          >
            <FileCode size={16} />
            HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportTXT}
            className="gap-2 border-2 border-purple-400 hover:border-purple-600 text-purple-700 hover:text-purple-900"
          >
            <FileText size={16} />
            TXT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMarkdown}
            className="gap-2 border-2 border-purple-400 hover:border-purple-600 text-purple-700 hover:text-purple-900"
          >
            📝 MD
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 border-2 border-purple-400 hover:border-purple-600 text-purple-700 hover:text-purple-900"
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

        {/* Symbol Tools */}
        <div className="flex gap-2 border-r-2 border-purple-300 pr-3 mr-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const symbol = prompt('Введите символ для вставки:');
              if (symbol) insertSymbol(symbol);
            }}
            className="gap-2 border-2 border-yellow-400 hover:border-yellow-600 text-yellow-700 hover:text-yellow-900"
          >
            <Type size={16} />
            Вставить символ
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-2 border-orange-400 hover:border-orange-600 text-orange-700 hover:text-orange-900"
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
                    className="h-8 w-8 p-0 text-lg border-2 border-gray-300 hover:border-gray-500"
                    onClick={() => insertSymbol(symbol)}
                  >
                    {symbol}
                  </Button>
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
            className="gap-2 border-2 border-gray-500 hover:border-gray-700 text-gray-700 hover:text-gray-900"
          >
            <Settings size={16} />
            Настройки
          </Button>
          
          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              className="gap-2 border-2 border-green-500 hover:border-green-700 text-green-700 hover:text-green-900"
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

      {/* Диалог настроек */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-popover border-2 border-gray-400">
          <DialogHeader>
            <DialogTitle>Настройки редактора</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Функции редактора:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>✅ Поддержка полного Markdown синтаксиса</div>
                <div>✅ HTML с inline-стилями</div>
                <div>✅ Предпросмотр (Ctrl+P)</div>
                <div>✅ Полноэкранный режим (F11)</div>
                <div>✅ Режим бок о бок (F9)</div>
                <div>✅ Автосохранение каждые 500мс</div>
                <div>✅ Подсветка синтаксиса</div>
              </div>
            </div>
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
                <div>Шрифт: Inter (загружен через Google Fonts)</div>
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

      {/* Улучшенные стили для EasyMDE */}
      <style>{`
        .markdown-editor-container .EasyMDEContainer {
          border-radius: 8px;
          border: 3px solid hsl(var(--border));
        }
        
        .markdown-editor-container .EasyMDEContainer .CodeMirror {
          min-height: 400px;
          font-size: 14px;
          line-height: 1.6;
          border-radius: 0 0 8px 8px;
          border: none;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .markdown-editor-container .editor-toolbar {
          border-radius: 8px 8px 0 0;
          background: hsl(var(--muted));
          border: none;
          border-bottom: 3px solid hsl(var(--border));
          padding: 8px !important;
        }
        
        .markdown-editor-container .editor-toolbar button {
          border: 2px solid transparent !important;
          background: rgba(147, 51, 234, 0.1) !important;
          color: rgb(147, 51, 234) !important;
          border-radius: 6px !important;
          margin: 2px !important;
          font-weight: bold !important;
          transition: all 0.2s ease !important;
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .markdown-editor-container .editor-toolbar button:hover {
          background: rgba(147, 51, 234, 0.2) !important;
          border-color: rgb(147, 51, 234) !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(147, 51, 234, 0.3);
        }
        
        .markdown-editor-container .editor-toolbar button.active {
          background: rgb(147, 51, 234) !important;
          color: white !important;
          border-color: rgb(147, 51, 234) !important;
        }
        
        .markdown-editor-container .editor-toolbar button:before {
          font-size: 16px !important;
          line-height: 1 !important;
        }
        
        .markdown-editor-container .editor-toolbar i.separator {
          border-left: 2px solid rgb(147, 51, 234);
          margin: 0 6px;
        }
        
        .markdown-editor-container .editor-toolbar.fullscreen {
          z-index: 1000;
        }
        
        .markdown-editor-container .CodeMirror-fullscreen {
          z-index: 1000;
        }
        
        .markdown-editor-container .editor-statusbar {
          border-top: 3px solid hsl(var(--border));
          background: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
          font-family: 'Inter', sans-serif;
        }
        
        .markdown-editor-container .editor-preview-side,
        .markdown-editor-container .editor-preview {
          font-family: 'Inter', sans-serif;
          padding: 16px;
        }
        
        /* Улучшенный предпросмотр */
        .markdown-editor-container .editor-preview h1,
        .markdown-editor-container .editor-preview h2,
        .markdown-editor-container .editor-preview h3 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }
        
        .markdown-editor-container .editor-preview blockquote {
          border-left: 4px solid hsl(var(--border));
          padding-left: 1em;
          margin: 1em 0;
          color: hsl(var(--muted-foreground));
        }
        
        .markdown-editor-container .editor-preview code {
          background: hsl(var(--muted));
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-size: 0.85em;
        }
        
        /* FontAwesome иконки */
        .markdown-editor-container .fa {
          font-family: FontAwesome !important;
          font-size: 14px !important;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;

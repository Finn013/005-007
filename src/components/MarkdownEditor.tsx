
import React, { useEffect, useRef, useState } from 'react';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import { Button } from '@/components/ui/button';
import { FileText, FileCode, Upload, Save } from 'lucide-react';

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
            const htmlContent = editorInstanceRef.current.options.previewRender?.(markdownContent) || markdownContent;
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

  return (
    <div className="space-y-4">
      {/* Панель инструментов для экспорта/импорта */}
      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
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

      {/* Кастомные стили для EasyMDE */}
      <style jsx>{`
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

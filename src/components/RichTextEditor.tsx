
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  ListOrdered,
  List,
  Link,
  Image,
  Table,
  Type
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

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
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
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Auto-save logic would be handled by parent component
      console.log('Auto-saving content...');
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content]);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertTable = () => {
    const table = `
      <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Ячейка 1</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Ячейка 2</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Ячейка 3</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Ячейка 4</td>
        </tr>
      </table>
    `;
    execCommand('insertHTML', table);
  };

  const insertLink = () => {
    const url = prompt('Введите URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Введите URL изображения:');
    if (url) {
      execCommand('insertImage', url);
    }
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

        {/* Lists */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
          >
            <ListOrdered size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
          >
            <List size={14} />
          </Button>
        </div>

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
            onClick={insertLink}
          >
            <Link size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={insertImage}
          >
            <Image size={14} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={insertTable}
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
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: content }}
        className="min-h-[400px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        style={{
          lineHeight: '1.6',
          fontSize: '14px'
        }}
      />

      {/* Auto-save indicator */}
      <div className="text-xs text-muted-foreground">
        ✓ Автосохранение включено
      </div>
    </div>
  );
};

export default RichTextEditor;

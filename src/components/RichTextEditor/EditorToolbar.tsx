
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Link,
  Image,
  Table,
  FileText,
  FileCode,
  Upload
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

interface EditorToolbarProps {
  onExportHTML: () => void;
  onExportTXT: () => void;
  onImport: (file: File) => void;
  onFormatText: (command: string, value?: string) => void;
  onInsertLink: () => void;
  onInsertImage: () => void;
  onInsertTable: () => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onExportHTML,
  onExportTXT,
  onImport,
  onFormatText,
  onInsertLink,
  onInsertImage,
  onInsertTable,
}) => {
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  };

  const changeFontSize = (size: string) => {
    onFormatText('fontSize', size);
  };

  const changeFontColor = (color: string) => {
    onFormatText('foreColor', color);
  };

  const changeBackgroundColor = (color: string) => {
    onFormatText('backColor', color);
  };

  return (
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
          onClick={() => onFormatText('bold')}
          size="sm"
        >
          <Bold size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-label="Курсив"
          onClick={() => onFormatText('italic')}
          size="sm"
        >
          <Italic size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="underline"
          aria-label="Подчеркнутый"
          onClick={() => onFormatText('underline')}
          size="sm"
        >
          <Underline size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="strikethrough"
          aria-label="Зачеркнутый"
          onClick={() => onFormatText('strikeThrough')}
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
          onClick={() => onFormatText('justifyLeft')}
          size="sm"
        >
          <AlignLeft size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="center"
          aria-label="По центру"
          onClick={() => onFormatText('justifyCenter')}
          size="sm"
        >
          <AlignCenter size={14} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="right"
          aria-label="По правому краю"
          onClick={() => onFormatText('justifyRight')}
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
          onClick={onInsertLink}
        >
          <Link size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onInsertImage}
        >
          <Image size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onInsertTable}
        >
          <Table size={14} />
        </Button>
      </div>
    </div>
  );
};

export default EditorToolbar;

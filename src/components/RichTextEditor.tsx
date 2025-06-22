
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, FileText, FileCode } from 'lucide-react';

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
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportHTML}
          className="gap-2"
        >
          <FileCode size={16} />
          HTML
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportTXT}
          className="gap-2"
        >
          <FileText size={16} />
          TXT
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-2"
        >
          <label className="cursor-pointer">
            <Upload size={16} />
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

      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Начните писать ваш документ..."
        className="min-h-[400px] font-mono text-sm"
      />
    </div>
  );
};

export default RichTextEditor;

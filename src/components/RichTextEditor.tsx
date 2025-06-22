
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Table,
  FileText,
  Download,
  Upload
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onExportHTML?: () => void;
  onExportTXT?: () => void;
  onImport?: (file: File) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onExportHTML,
  onExportTXT,
  onImport
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Введите URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const insertTable = () => {
    const tableHTML = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><td>Ячейка 1</td><td>Ячейка 2</td></tr>
        <tr><td>Ячейка 3</td><td>Ячейка 4</td></tr>
      </table>
    `;
    executeCommand('insertHTML', tableHTML);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        executeCommand('insertImage', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  return (
    <div className="border rounded-lg bg-background">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1">
        {/* Text formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('bold')}
        >
          <Bold size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('italic')}
        >
          <Italic size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('underline')}
        >
          <Underline size={16} />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('justifyLeft')}
        >
          <AlignLeft size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('justifyCenter')}
        >
          <AlignCenter size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('justifyRight')}
        >
          <AlignRight size={16} />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('insertUnorderedList')}
        >
          <List size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand('insertOrderedList')}
        >
          <ListOrdered size={16} />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Insert elements */}
        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}
        >
          <Link size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <Image size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertTable}
        >
          <Table size={16} />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* File operations */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFileImport}
        >
          <Upload size={16} />
        </Button>
        {onExportHTML && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportHTML}
          >
            <FileText size={16} />
          </Button>
        )}
        {onExportTXT && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportTXT}
          >
            <Download size={16} />
          </Button>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[400px] p-4 focus:outline-none"
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={handleContentChange}
        onBlur={handleContentChange}
        style={{ minHeight: '400px' }}
      />

      {/* Hidden file inputs */}
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.txt,.json"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default RichTextEditor;

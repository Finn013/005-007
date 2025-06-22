
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { Note } from '../types/note';
import { generateUUID } from '../utils/idGenerator';
import { toast } from '@/hooks/use-toast';

interface EditorPageProps {
  onBack: () => void;
  onSave: (note: Note) => void;
  existingNote?: Note;
}

const EditorPage: React.FC<EditorPageProps> = ({ onBack, onSave, existingNote }) => {
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.htmlContent || '');

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название документа",
        variant: "destructive",
      });
      return;
    }

    const note: Note = {
      id: existingNote?.id || generateUUID(),
      title: title.trim(),
      content: content.replace(/<[^>]*>/g, ''), // Plain text for search
      htmlContent: content,
      createdAt: existingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: existingNote?.color || '#ffffff',
      fontSize: existingNote?.fontSize || 'medium',
      isSelected: false,
      tags: existingNote?.tags || [],
      type: 'editor',
    };

    onSave(note);
    toast({
      title: "Документ сохранён",
      description: "Документ успешно сохранён",
    });
  };

  const exportAsHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        td, th { border: 1px solid #ddd; padding: 8px; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${content}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9\u0400-\u04FF]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsTXT = () => {
    const textContent = content.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n');
    const blob = new Blob([`${title}\n\n${textContent}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9\u0400-\u04FF]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (file.type === 'text/html' || file.name.endsWith('.html')) {
        setContent(content);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        setContent(content.replace(/\n/g, '<br>'));
      } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(content);
          if (data.title) setTitle(data.title);
          if (data.content) setContent(data.content);
        } catch (error) {
          toast({
            title: "Ошибка импорта",
            description: "Неверный формат JSON файла",
            variant: "destructive",
          });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
              >
                <ArrowLeft size={16} className="mr-2" />
                Назад
              </Button>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название документа..."
                className="max-w-md"
              />
            </div>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <RichTextEditor
          content={content}
          onChange={setContent}
          onExportHTML={exportAsHTML}
          onExportTXT={exportAsTXT}
          onImport={handleImport}
        />
      </main>
    </div>
  );
};

export default EditorPage;

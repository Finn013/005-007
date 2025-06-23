
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Tag, Plus, X, FileText, Code } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import MarkdownEditor from './MarkdownEditor';
import TagSelector from './TagSelector';
import { Note } from '../types/note';
import { generateUUID } from '../utils/idGenerator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface EditorPageProps {
  onBack: () => void;
  onSave: (note: Note) => void;
  existingNote?: Note;
}

const EditorPage: React.FC<EditorPageProps> = ({ onBack, onSave, existingNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editorType, setEditorType] = useState<'rich' | 'markdown'>('rich');

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setHtmlContent(existingNote.htmlContent || '');
      setMarkdownContent(existingNote.markdownContent || existingNote.content);
      setTags(existingNote.tags || []);
      setEditorType(existingNote.editorType || 'rich');
    }
  }, [existingNote]);

  const handleSave = () => {
    const note: Note = {
      id: existingNote?.id || generateUUID(),
      title: title || 'Без названия',
      content,
      htmlContent,
      markdownContent,
      editorType,
      createdAt: existingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: existingNote?.color || '#ffffff',
      fontSize: existingNote?.fontSize || 'medium',
      isSelected: false,
      tags,
      type: 'editor',
    };
    onSave(note);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addExistingTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleExportHTML = () => {
    const exportContent = editorType === 'markdown' ? htmlContent : htmlContent;
    const blob = new Blob([exportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTXT = () => {
    const exportContent = editorType === 'markdown' ? markdownContent : content;
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      if (file.name.endsWith('.md')) {
        setMarkdownContent(fileContent);
        setContent(fileContent);
        setEditorType('markdown');
      } else if (file.type === 'text/html') {
        setHtmlContent(fileContent);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = fileContent;
        setContent(tempDiv.textContent || tempDiv.innerText || '');
        setEditorType('rich');
      } else {
        setContent(fileContent);
        if (editorType === 'markdown') {
          setMarkdownContent(fileContent);
        } else {
          setHtmlContent(fileContent);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleRichTextChange = (newHtmlContent: string, newPlainText: string) => {
    setHtmlContent(newHtmlContent);
    setContent(newPlainText);
  };

  const handleMarkdownChange = (newHtmlContent: string, newPlainText: string, newMarkdownContent: string) => {
    setHtmlContent(newHtmlContent);
    setContent(newPlainText);
    setMarkdownContent(newMarkdownContent);
  };

  const allExistingTags: string[] = [];
  const availableTags = allExistingTags.filter(tag => !tags.includes(tag));

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft size={16} />
              Назад
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save size={16} />
              Сохранить
            </Button>
          </div>
          
          <div className="space-y-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название документа"
              className="text-lg font-medium"
            />
            
            <div className="flex flex-wrap gap-2 items-center">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-full text-xs">
                  <Tag size={12} />
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-destructive hover:text-destructive/80">
                    <X size={12} />
                  </button>
                </span>
              ))}
              
              <div className="flex items-center gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Новый тег"
                  className="h-7 text-xs w-24"
                />
                <Button onClick={addTag} size="sm" className="h-7 w-7 p-0">
                  <Plus size={12} />
                </Button>
                {availableTags.length > 0 && (
                  <TagSelector 
                    availableTags={availableTags}
                    onSelectTag={addExistingTag}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={editorType} onValueChange={(value) => setEditorType(value as 'rich' | 'markdown')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="rich" className="gap-2">
              <FileText size={16} />
              Богатый редактор
            </TabsTrigger>
            <TabsTrigger value="markdown" className="gap-2">
              <Code size={16} />
              Markdown редактор
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rich">
            <RichTextEditor
              content={htmlContent}
              onChange={handleRichTextChange}
              onExportHTML={handleExportHTML}
              onExportTXT={handleExportTXT}
              onImport={handleImport}
            />
          </TabsContent>
          
          <TabsContent value="markdown">
            <MarkdownEditor
              content={markdownContent}
              onChange={handleMarkdownChange}
              onExportHTML={handleExportHTML}
              onExportTXT={handleExportTXT}
              onImport={handleImport}
              onSave={handleSave}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditorPage;

import React, { useState, useRef } from 'react';
import { Copy, Send, QrCode, Delete, Menu, Plus, X, Tag, Check, GripVertical, ChevronDown, Edit, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Note, ListItem } from '../types/note';
import { generateQRCodeURL } from '../utils/qrGenerator';
import { exportSingleNote } from '../utils/exportUtils';
import { toast } from '@/hooks/use-toast';
import { generateUUID } from '../utils/idGenerator';
import TagSelector from './TagSelector';
import ImageUploadDialog from './ImageUploadDialog';

interface NoteCardProps {
  note: Note;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onEdit?: (note: Note) => void;
  globalFontSize: string;
  onReorder?: (draggedId: string, targetId: string) => void;
  allTags: string[];
}

const colors = [
  '#ffffff', // белый
  '#fef3c7', // желтый
  '#dbeafe', // голубой
  '#dcfce7', // зеленый  
  '#fce7f3', // розовый
  '#f3e8ff', // фиолетовый
  '#fed7d7', // красный
];

const darkColors = [
  '#374151', // темно-серый
  '#92400e', // темно-желтый
  '#1e3a8a', // темно-синий
  '#166534', // темно-зеленый
  '#be185d', // темно-розовый
  '#6b21a8', // темно-фиолетовый
  '#dc2626', // темно-красный
];

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onUpdate, 
  onDelete, 
  onToggleSelect,
  onEdit,
  globalFontSize,
  onReorder,
  allTags = []
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [tempTitle, setTempTitle] = useState(note.title);
  const [tempContent, setTempContent] = useState(note.content);
  const [tempTags, setTempTags] = useState(note.tags || []);
  const [newTag, setNewTag] = useState('');
  const [tempListItems, setTempListItems] = useState(note.listItems || []);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDarkTheme = document.documentElement.classList.contains('dark');
  const availableColors = isDarkTheme ? darkColors : colors;

  const handleSave = () => {
    const updatedNote = {
      ...note,
      title: tempTitle || 'Без названия',
      content: tempContent,
      tags: tempTags,
      listItems: note.type === 'list' ? tempListItems : undefined,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedNote);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(note.title);
    setTempContent(note.content);
    setTempTags(note.tags || []);
    setTempListItems(note.listItems || []);
    setIsEditing(false);
  };

  const insertImageIntoNote = (imageData: string, altText: string) => {
    const imageMarkdown = `![${altText}](${imageData})\n`;
    const cursorPos = textareaRef.current?.selectionStart || tempContent.length;
    const newContent = tempContent.slice(0, cursorPos) + imageMarkdown + tempContent.slice(cursorPos);
    setTempContent(newContent);
    
    // Обновляем позицию курсора
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = cursorPos + imageMarkdown.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleCopy = () => {
    let textToCopy = `${note.title}\n\n`;
    if (note.type === 'list' && note.listItems) {
      textToCopy += note.listItems.map(item => 
        `${item.completed ? '✓' : '○'} ${item.text}`
      ).join('\n');
    } else if (note.type === 'editor' && note.htmlContent) {
      textToCopy += note.htmlContent.replace(/<[^>]*>/g, '');
    } else {
      textToCopy += note.content;
    }
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Скопировано!",
      description: "Заметка скопирована в буфер обмена",
    });
  };

  const handleShare = async () => {
    let shareText = `${note.title}\n\n`;
    if (note.type === 'list' && note.listItems) {
      shareText += note.listItems.map(item => 
        `${item.completed ? '✓' : '○'} ${item.text}`
      ).join('\n');
    } else if (note.type === 'editor' && note.htmlContent) {
      shareText += note.htmlContent.replace(/<[^>]*>/g, '');
    } else {
      shareText += note.content;
    }
    
    // Проверяем наличие Android JavaScript интерфейса для APK
    if (typeof (window as any).Android !== 'undefined' && (window as any).Android.shareText) {
      try {
        (window as any).Android.shareText(shareText);
        return;
      } catch (error) {
        console.log('Ошибка Android share interface, используем Web Share API');
      }
    }
    
    const shareData = {
      title: note.title,
      text: shareText,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleColorChange = (color: string) => {
    onUpdate({ ...note, color });
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    onUpdate({ ...note, fontSize });
  };

  const addTag = () => {
    if (newTag.trim() && !tempTags.includes(newTag.trim())) {
      setTempTags([...tempTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const addExistingTag = (tag: string) => {
    if (!tempTags.includes(tag)) {
      setTempTags([...tempTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTempTags(tempTags.filter(tag => tag !== tagToRemove));
  };

  const addListItem = () => {
    const newItem: ListItem = {
      id: generateUUID(),
      text: '',
      completed: false,
      order: tempListItems.length
    };
    setTempListItems([...tempListItems, newItem]);
  };

  const updateListItem = (id: string, text: string) => {
    setTempListItems(tempListItems.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const toggleListItem = (id: string) => {
    const updatedItems = tempListItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    const sortedItems = updatedItems.sort((a, b) => {
      if (a.completed === b.completed) return (a.order || 0) - (b.order || 0);
      return a.completed ? 1 : -1;
    });
    
    setTempListItems(sortedItems);
  };

  const deleteListItem = (id: string) => {
    setTempListItems(tempListItems.filter(item => item.id !== id));
  };

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base', 
    large: 'text-lg'
  }[note.fontSize];

  const handleExportNote = async () => {
    try {
      await exportSingleNote(note);
      toast({
        title: "Экспорт завершён",
        description: "Заметка экспортирована",
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать заметку",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = () => {
    if (note.type === 'editor' && onEdit) {
      onEdit(note);
    } else {
      setIsEditing(true);
    }
  };

  const getContentToDisplay = () => {
    if (note.type === 'list' && note.listItems) {
      return (
        <div className="space-y-1">
          {note.listItems.map(item => (
            <div key={item.id} className={`flex items-center gap-2 ${item.completed ? 'opacity-60' : ''}`}>
              <Check size={16} className={item.completed ? 'text-green-500' : 'text-gray-400'} />
              <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
            </div>
          ))}
        </div>
      );
    } else if (note.type === 'editor' && note.htmlContent) {
      return (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: note.htmlContent.slice(0, 200) + (note.htmlContent.length > 200 ? '...' : '') }}
        />
      );
    } else {
      return note.content || 'Нажмите для редактирования...';
    }
  };

  const getTypeIcon = () => {
    switch (note.type) {
      case 'list': return '📋 Список';
      case 'editor': return '📄 Документ';
      default: return '📝 Заметка';
    }
  };

  const getTypeStyles = () => {
    const baseStyles = "rounded-lg border-2 shadow-sm transition-all duration-200 hover:shadow-md";
    
    switch (note.type) {
      case 'note':
        return `${baseStyles} border-blue-400 shadow-blue-400/30 hover:shadow-blue-400/50 shadow-lg`;
      case 'list':
        return `${baseStyles} border-green-400 shadow-green-400/30 hover:shadow-green-400/50 shadow-lg`;
      case 'editor':
        return `${baseStyles} border-purple-400 shadow-purple-400/30 hover:shadow-purple-400/50 shadow-lg`;
      default:
        return `${baseStyles} border-gray-400 shadow-gray-400/30 hover:shadow-gray-400/50 shadow-lg`;
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent | React.TouchEvent) => {
    if ('dataTransfer' in e) {
      e.dataTransfer.setData('text/plain', note.id);
      e.dataTransfer.effectAllowed = 'move';
    }
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartPos({ x: clientX, y: clientY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId !== note.id && onReorder) {
      onReorder(draggedId, note.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - dragStartPos.x);
    const deltaY = Math.abs(touch.clientY - dragStartPos.y);
    
    if (deltaX > 10 || deltaY > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetCard = element?.closest('[data-note-id]');
    
    if (targetCard && onReorder) {
      const targetId = targetCard.getAttribute('data-note-id');
      if (targetId && targetId !== note.id) {
        onReorder(note.id, targetId);
      }
    }
  };

  const availableTags = allTags.filter(tag => !tempTags.includes(tag));

  return (
    <>
      <div 
        data-note-id={note.id}
        className={`${getTypeStyles()} ${
          note.isSelected ? 'ring-2 ring-primary' : ''
        } ${isDragging ? 'opacity-50 scale-95' : ''}`}
        style={{ backgroundColor: note.color }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-2 sm:p-3 border-b bg-white/50 dark:bg-black/30 rounded-t-lg cursor-move"
          draggable={!isEditing}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            <GripVertical size={14} className="text-muted-foreground shrink-0" />
            <div className="scale-75 sm:scale-100 shrink-0">
              <Checkbox
                checked={note.isSelected}
                onCheckedChange={() => onToggleSelect(note.id)}
              />
            </div>
            {isEditing ? (
              <div className="flex-1 space-y-2 min-w-0">
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="h-7 sm:h-8 text-sm"
                  placeholder="Название заметки"
                />
                <div className="flex flex-wrap gap-1">
                  {tempTags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-full text-xs">
                      <Tag size={10} />
                      <span className="truncate max-w-20">{tag}</span>
                      <button onClick={() => removeTag(tag)} className="text-destructive hover:text-destructive/80 shrink-0">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Тег"
                      className="h-6 text-xs w-16 sm:w-20"
                    />
                    <Button onClick={addTag} size="sm" className="h-6 w-6 p-0">
                      <Plus size={10} />
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
            ) : (
              <div className="flex-1 min-w-0">
                <h3 
                  className={`font-medium truncate cursor-pointer ${fontSizeClass}`}
                  onClick={handleEditClick}
                >
                  {note.title || 'Без названия'}
                </h3>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/20 rounded-full text-xs">
                        <Tag size={8} />
                        <span className="truncate max-w-12 sm:max-w-none">{tag}</span>
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">+{note.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0">
                <Menu size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="bg-popover w-48">
              {note.type === 'editor' && onEdit && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(note)}>
                    <Edit size={16} className="mr-2" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {isEditing && note.type === 'note' && (
                <>
                  <DropdownMenuItem onClick={() => setShowImageUpload(true)}>
                    <Image size={16} className="mr-2" />
                    Вставить изображение
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleCopy}>
                <Copy size={16} className="mr-2" />
                Копировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Send size={16} className="mr-2" />
                Отправить
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowQR(true)}>
                <QrCode size={16} className="mr-2" />
                QR-код
              </DropdownMenuItem>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  🔤 Размер шрифта
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-32">
                  <DropdownMenuItem
                    onClick={() => handleFontSizeChange('small')}
                    className={note.fontSize === 'small' ? 'bg-accent' : ''}
                  >
                    Маленький
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFontSizeChange('medium')}
                    className={note.fontSize === 'medium' ? 'bg-accent' : ''}
                  >
                    Средний
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFontSizeChange('large')}
                    className={note.fontSize === 'large' ? 'bg-accent' : ''}
                  >
                    Большой
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Цвет заметки:</div>
                <div className="flex gap-1 flex-wrap">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 ${
                        note.color === color ? 'border-primary' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportNote}>
                📤 Экспорт заметки
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(note.id)}
                className="text-destructive"
              >
                <Delete size={16} className="mr-2" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-3">
          {isEditing && note.type !== 'editor' ? (
            <div className="space-y-3">
              {note.type === 'list' ? (
                <div className="space-y-2">
                  {tempListItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleListItem(item.id)}
                        className="shrink-0"
                      />
                      <Input
                        value={item.text}
                        onChange={(e) => updateListItem(item.id, e.target.value)}
                        className={`flex-1 text-sm ${item.completed ? 'line-through opacity-60' : ''}`}
                        placeholder="Пункт списка"
                      />
                      <Button 
                        onClick={() => deleteListItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive shrink-0"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addListItem} variant="outline" size="sm" className="w-full text-sm">
                    <Plus size={14} className="mr-2" />
                    Добавить пункт
                  </Button>
                </div>
              ) : (
                <Textarea
                  ref={textareaRef}
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  placeholder="Содержимое заметки..."
                  className={`min-h-[200px] sm:min-h-[250px] max-h-[400px] sm:max-h-[500px] resize-y ${fontSizeClass} text-sm`}
                  rows={8}
                />
              )}
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleSave} size="sm" className="text-sm">
                  Сохранить
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" className="text-sm">
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className={`whitespace-pre-wrap cursor-pointer min-h-[60px] max-h-[150px] sm:max-h-[200px] overflow-y-auto ${fontSizeClass} text-sm leading-relaxed`}
              onClick={handleEditClick}
            >
              {getContentToDisplay()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-2 sm:px-3 pb-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="truncate">{getTypeIcon()}</span>
            <span className="text-xs whitespace-nowrap ml-2">
              {new Date(note.createdAt).toLocaleDateString('ru')}
            </span>
          </div>
        </div>
      </div>

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        open={showImageUpload}
        onOpenChange={setShowImageUpload}
        onInsertImage={insertImageIntoNote}
      />

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR-код заметки</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <img 
              src={generateQRCodeURL((() => {
                let qrText = `${note.title}\n\n`;
                if (note.type === 'list' && note.listItems) {
                  qrText += note.listItems.map(item => 
                    `${item.completed ? '✓' : '○'} ${item.text}`
                  ).join('\n');
                } else if (note.type === 'editor' && note.htmlContent) {
                  qrText += note.htmlContent.replace(/<[^>]*>/g, '');
                } else {
                  qrText += note.content;
                }
                return qrText;
              })())}
              alt="QR Code"
              className="border rounded max-w-full"
            />
            <p className="text-sm text-muted-foreground text-center">
              Отсканируйте QR-код для просмотра содержимого заметки
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteCard;

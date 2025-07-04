
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Settings, Search, X, Tag, ChevronDown, Image } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppSettings } from '../types/note';
import ImageUploadDialog from './ImageUploadDialog';

type HeaderMode = 'selector' | 'notes' | 'tasks' | 'editor' | 'all' | 'settings';

interface HeaderProps {
  mode: HeaderMode;
  onBack?: () => void;
  onAddNote?: () => void;
  onAddTask?: () => void;
  onAddEditor?: () => void;
  onSettings?: () => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onSortChange?: (sortBy: AppSettings['sortBy']) => void;
  currentSort?: AppSettings['sortBy'];
  allTags?: string[];
  onTagSearch?: (tag: string) => void;
  selectedTag?: string;
  onClearTagSearch?: () => void;
  onInsertImage?: (imageData: string, altText: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  mode,
  onBack,
  onAddNote,
  onAddTask,
  onAddEditor,
  onSettings,
  onSearch,
  searchQuery = '',
  onSortChange,
  currentSort = 'date',
  allTags = [],
  onTagSearch,
  selectedTag,
  onClearTagSearch,
  onInsertImage,
}) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const getTitle = () => {
    switch (mode) {
      case 'notes':
        return 'Быстрые заметки';
      case 'tasks':
        return 'Списки задач';
      case 'editor':
        return 'Текстовые документы';
      case 'all':
        return 'Все документы';
      case 'settings':
        return 'Настройки';
      default:
        return 'Заметки';
    }
  };

  const getSortLabel = (sortBy: string) => {
    switch (sortBy) {
      case 'date': return 'По дате';
      case 'title': return 'По названию';
      case 'tags': return 'По тегам';
      case 'type': return 'По категории';
      case 'color': return 'По цвету';
      case 'manual': return 'Вручную';
      default: return 'По дате';
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-3">
        <div className="container mx-auto px-2 md:px-4 py-2 md:py-4">
          {/* Mobile layout for 'all' mode */}
          {mode === 'all' && (
            <div className="md:hidden">
              {/* First row: Back button, title, settings */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onBack} className="border-2 min-w-0 p-2">
                    <ArrowLeft size={16} />
                  </Button>
                  <h1 className="text-lg font-semibold truncate">{getTitle()}</h1>
                </div>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="gap-1 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-600 min-w-0 p-2">
                        <Plus size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={onAddTask} className="text-green-600 font-medium">
                        📋 Список
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onAddNote} className="text-blue-600 font-medium">
                        📝 Заметка
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onAddEditor} className="text-purple-600 font-medium">
                        📄 Документ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="sm" onClick={onSettings} className="border-2 min-w-0 p-2">
                    <Settings size={16} />
                  </Button>
                </div>
              </div>
              
              {/* Second row: Search, tags, sort */}
              <div className="flex items-center gap-1 flex-wrap">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => onSearch?.(e.target.value)}
                    className="px-2 py-1 border-2 rounded-md text-sm flex-1 min-w-0"
                  />
                  <Search size={14} className="text-muted-foreground" />
                </div>
                
                {selectedTag ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-full text-xs">
                    <Tag size={10} />
                    <span className="truncate max-w-16">{selectedTag}</span>
                    <button onClick={onClearTagSearch} className="text-destructive hover:text-destructive/80">
                      <X size={10} />
                    </button>
                  </div>
                ) : allTags.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1 border-2 min-w-0 px-2">
                        <Tag size={12} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {allTags.map((tag) => (
                        <DropdownMenuItem key={tag} onClick={() => onTagSearch?.(tag)}>
                          {tag}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Select value={currentSort} onValueChange={onSortChange}>
                  <SelectTrigger className="w-20 border-2 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Дата</SelectItem>
                    <SelectItem value="title">Имя</SelectItem>
                    <SelectItem value="tags">Теги</SelectItem>
                    <SelectItem value="type">Тип</SelectItem>
                    <SelectItem value="color">Цвет</SelectItem>
                    <SelectItem value="manual">Ручн.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Desktop layout for all modes */}
          <div className={mode === 'all' ? 'hidden md:flex' : 'flex'}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                {mode !== 'selector' && (
                  <Button variant="outline" size="sm" onClick={onBack} className="border-2 min-w-0">
                    <ArrowLeft size={16} />
                  </Button>
                )}
                <h1 className="text-lg md:text-xl font-semibold truncate">{getTitle()}</h1>
              </div>

              <div className="flex items-center gap-1 md:gap-2 min-w-0">
                {/* Search and Tag Search for All Documents */}
                {mode === 'all' && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Поиск..."
                        value={searchQuery}
                        onChange={(e) => onSearch?.(e.target.value)}
                        className="px-3 py-1 border-2 rounded-md text-sm w-32"
                      />
                      <Search size={16} />
                    </div>
                    
                    {selectedTag ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-full text-xs">
                        <Tag size={12} />
                        {selectedTag}
                        <button onClick={onClearTagSearch} className="text-destructive hover:text-destructive/80">
                          <X size={12} />
                        </button>
                      </div>
                    ) : allTags.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 border-2">
                            <Tag size={14} />
                            Теги
                            <ChevronDown size={12} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {allTags.map((tag) => (
                            <DropdownMenuItem key={tag} onClick={() => onTagSearch?.(tag)}>
                              {tag}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <Select value={currentSort} onValueChange={onSortChange}>
                      <SelectTrigger className="w-40 border-2">
                        <SelectValue>{getSortLabel(currentSort)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">По дате</SelectItem>
                        <SelectItem value="title">По названию</SelectItem>
                        <SelectItem value="tags">По тегам</SelectItem>
                        <SelectItem value="type">По категории</SelectItem>
                        <SelectItem value="color">По цвету</SelectItem>
                        <SelectItem value="manual">Вручную</SelectItem>
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" className="gap-1 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-600">
                          <Plus size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={onAddTask} className="text-green-600 font-medium">
                          📋 Список
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onAddNote} className="text-blue-600 font-medium">
                          📝 Заметка
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onAddEditor} className="text-purple-600 font-medium">
                          📄 Документ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}

                {/* Add buttons for specific modes */}
                {mode === 'notes' && (
                  <Button onClick={onAddNote} size="sm" className="gap-1 md:gap-2 bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-600">
                    <Plus size={16} />
                    <span className="hidden sm:inline">Создать заметку</span>
                  </Button>
                )}

                {mode === 'tasks' && (
                  <Button onClick={onAddTask} size="sm" className="gap-1 md:gap-2 bg-green-500 hover:bg-green-600 text-white border-2 border-green-600">
                    <Plus size={16} />
                    <span className="hidden sm:inline">Создать список</span>
                  </Button>
                )}

                {mode === 'editor' && (
                  <Button onClick={onAddEditor} size="sm" className="gap-1 md:gap-2 bg-purple-500 hover:bg-purple-600 text-white border-2 border-purple-600">
                    <Plus size={16} />
                    <span className="hidden sm:inline">Создать документ</span>
                  </Button>
                )}

                {mode !== 'settings' && mode !== 'selector' && (
                  <Button variant="outline" size="sm" onClick={onSettings} className="border-2 min-w-0">
                    <Settings size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Dialog */}
      {onInsertImage && (
        <ImageUploadDialog
          open={imageDialogOpen}
          onOpenChange={setImageDialogOpen}
          onInsertImage={onInsertImage}
        />
      )}
    </>
  );
};

export default Header;

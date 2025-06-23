
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Settings, Search, X, Tag, ChevronDown } from 'lucide-react';
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
}) => {
  const getTitle = () => {
    switch (mode) {
      case 'notes':
        return 'Быстрые заметки';
      case 'tasks':
        return 'Списки задач';
      case 'editor':
        return 'Текстовый редактор';
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
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {mode !== 'selector' && (
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft size={16} />
              </Button>
            )}
            <h1 className="text-xl font-semibold">{getTitle()}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Search and Tag Search for All Documents */}
            {mode === 'all' && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => onSearch?.(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm w-32"
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
                      <Button variant="outline" size="sm" className="gap-1">
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
                  <SelectTrigger className="w-40">
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
                    <Button size="sm" className="gap-1">
                      <Plus size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={onAddTask}>
                      Список
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onAddNote}>
                      Заметка
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onAddEditor}>
                      Документ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Add buttons for specific modes */}
            {mode === 'notes' && (
              <Button onClick={onAddNote} size="sm" className="gap-2">
                <Plus size={16} />
                Создать заметку
              </Button>
            )}

            {mode === 'tasks' && (
              <Button onClick={onAddTask} size="sm" className="gap-2">
                <Plus size={16} />
                Создать список
              </Button>
            )}

            {mode !== 'settings' && mode !== 'selector' && (
              <Button variant="outline" size="sm" onClick={onSettings}>
                <Settings size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

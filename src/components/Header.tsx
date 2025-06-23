
import React, { useState } from 'react';
import { Plus, Menu, Share, Trash, ChevronDown, ArrowLeft, Search, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { AppSettings } from '../types/note';

interface HeaderProps {
  onCreateNote: () => void;
  onCreateList: () => void;
  onCreateEditor?: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  onImportNotes: (file: File) => void;
  onExportAllNotes: () => void;
  selectedCount?: number;
  onExportSelected?: () => void;
  onDeleteSelected?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  viewMode?: string;
  allTags?: string[];
  onTagFilter?: (tag: string | null) => void;
  activeTagFilter?: string | null;
}

const Header: React.FC<HeaderProps> = ({ 
  onCreateNote,
  onCreateList,
  onCreateEditor,
  settings, 
  onSettingsChange, 
  onImportNotes,
  onExportAllNotes,
  selectedCount = 0,
  onExportSelected,
  onDeleteSelected,
  onBack,
  showBackButton = false,
  viewMode = '',
  allTags = [],
  onTagFilter,
  activeTagFilter
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportNotes(file);
      event.target.value = '';
    }
  };

  const getCreateButtons = () => {
    if (viewMode === 'tasks') {
      return (
        <Button onClick={onCreateList} size="sm" className="gap-2">
          <Plus size={16} />
          <span className="hidden sm:inline">Создать список</span>
        </Button>
      );
    }
    
    if (viewMode === 'notes') {
      return (
        <Button onClick={onCreateNote} size="sm" className="gap-2">
          <Plus size={16} />
          <span className="hidden sm:inline">Создать заметку</span>
        </Button>
      );
    }
    
    if (viewMode === 'all') {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus size={16} />
              <span className="hidden sm:inline">Создать</span>
              <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={onCreateList}>
              📋 Список
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateNote}>
              📝 Заметку
            </DropdownMenuItem>
            {onCreateEditor && (
              <DropdownMenuItem onClick={onCreateEditor}>
                📄 Документ
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    
    return null;
  };

  const getMenuContent = () => {
    if (viewMode === 'tasks' || viewMode === 'notes') {
      return (
        <DropdownMenuContent align="start" className="w-56 bg-popover">
          <DropdownMenuItem onClick={onExportAllNotes}>
            📤 Экспорт
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <label className="cursor-pointer">
              📥 Импорт
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </DropdownMenuItem>
          
          {selectedCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExportSelected} className="text-primary">
                <Share size={16} className="mr-2" />
                Отправить выбранные ({selectedCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteSelected} className="text-destructive">
                <Trash size={16} className="mr-2" />
                Удалить выбранные ({selectedCount})
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      );
    }

    return (
      <DropdownMenuContent align="start" className="w-56 bg-popover">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            📊 Сортировка
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => onSettingsChange({ sortBy: 'date' })}
              className={settings.sortBy === 'date' ? 'bg-accent' : ''}
            >
              По дате
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSettingsChange({ sortBy: 'title' })}
              className={settings.sortBy === 'title' ? 'bg-accent' : ''}
            >
              По названию
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSettingsChange({ sortBy: 'tags' })}
              className={settings.sortBy === 'tags' ? 'bg-accent' : ''}
            >
              По тегам
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSettingsChange({ sortBy: 'type' })}
              className={settings.sortBy === 'type' ? 'bg-accent' : ''}
            >
              По категории
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSettingsChange({ sortBy: 'color' })}
              className={settings.sortBy === 'color' ? 'bg-accent' : ''}
            >
              По цвету
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onExportAllNotes}>
          📤 Экспорт всех заметок
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <label className="cursor-pointer">
            📥 Импорт заметок
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </DropdownMenuItem>
        
        {selectedCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportSelected} className="text-primary">
              <Share size={16} className="mr-2" />
              Отправить выбранные ({selectedCount})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteSelected} className="text-destructive">
              <Trash size={16} className="mr-2" />
              Удалить выбранные ({selectedCount})
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {showBackButton && onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft size={16} className="mr-2" />
              Назад
            </Button>
          )}
          
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Menu size={16} />
                {selectedCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            {getMenuContent()}
          </DropdownMenu>

          {viewMode === 'all' && allTags && allTags.length > 0 && onTagFilter && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Tag size={16} />
                    Теги
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-popover max-h-60 overflow-y-auto">
                  {allTags.map(tag => (
                    <DropdownMenuItem
                      key={tag}
                      onClick={() => onTagFilter(tag)}
                      className={activeTagFilter === tag ? 'bg-accent' : ''}
                    >
                      <Tag size={14} className="mr-2" />
                      {tag}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {activeTagFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTagFilter(null)}
                  className="gap-2"
                >
                  <X size={16} />
                  {activeTagFilter}
                </Button>
              )}
            </>
          )}
        </div>

        <h1 className="text-xl font-bold text-foreground">📝 Заметки</h1>
        
        <div className="flex items-center gap-2">
          {getCreateButtons()}
        </div>
      </div>
    </header>
  );
};

export default Header;

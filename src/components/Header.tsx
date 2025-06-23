
import React, { useState } from 'react';
import { Plus, Menu, Share, Trash, ChevronDown, ArrowLeft } from 'lucide-react';
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
  showBackButton = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportNotes(file);
      event.target.value = '';
    }
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
            <DropdownMenuContent align="start" className="w-56 bg-popover">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Plus size={16} className="mr-2" />
                  Создать
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={onCreateNote}>
                    📝 Заметку
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onCreateList}>
                    📋 Список
                  </DropdownMenuItem>
                  {onCreateEditor && (
                    <DropdownMenuItem onClick={onCreateEditor}>
                      📄 Документ
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSeparator />
              
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
          </DropdownMenu>
        </div>

        <h1 className="text-xl font-bold text-foreground">📝 Заметки</h1>
        
        <div className="flex items-center gap-2">
          <DropdownMenu open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                <span className="hidden sm:inline">Создать</span>
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={onCreateNote}>
                📝 Заметку
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateList}>
                📋 Список
              </DropdownMenuItem>
              {onCreateEditor && (
                <DropdownMenuItem onClick={onCreateEditor}>
                  📄 Документ
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;

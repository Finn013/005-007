import React, { useEffect, useState } from 'react';
import { generateUUID } from '../utils/idGenerator';
import Header from '../components/Header';
import NoteCard from '../components/NoteCard';
import ModeSelector from '../components/ModeSelector';
import EditorPage from '../components/EditorPage';
import SettingsPage from '../components/SettingsPage';
import TrashPage from '../components/TrashPage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Note, AppSettings } from '../types/note';
import { exportNotes, importNotes } from '../utils/exportUtils';
import { toast } from '@/hooks/use-toast';

const defaultSettings: AppSettings = {
  theme: 'light',
  globalFontSize: 'medium',
  sortBy: 'date',
  trashRetentionDays: 7,
};

type ViewMode = 'selector' | 'notes' | 'tasks' | 'editor' | 'all' | 'editing' | 'settings' | 'trash';

const Index = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('sticky-notes', []);
  const [trashedNotes, setTrashedNotes] = useLocalStorage<Note[]>('trashed-notes', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', defaultSettings);
  const [viewMode, setViewMode] = useState<ViewMode>('selector');
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.className = settings.theme;
    
    // Apply global font size
    const fontSizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    };
    
    document.documentElement.style.fontSize = settings.globalFontSize === 'small' ? '14px' : 
                                               settings.globalFontSize === 'large' ? '18px' : '16px';
  }, [settings.theme, settings.globalFontSize]);

  // Migration for existing notes to add new fields
  useEffect(() => {
    const migratedNotes = notes.map(note => ({
      ...note,
      tags: note.tags || [],
      type: note.type || 'note' as const,
      listItems: note.listItems || undefined,
      htmlContent: note.htmlContent || undefined
    }));
    
    const hasChanges = migratedNotes.some(note => 
      !note.tags || !note.type
    );
    
    if (hasChanges) {
      setNotes(migratedNotes);
    }
  }, []);

  const createNote = () => {
    const newNote: Note = {
      id: generateUUID(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: '#ffffff',
      fontSize: settings.globalFontSize,
      isSelected: false,
      tags: [],
      type: 'note',
    };
    setNotes([newNote, ...notes]);
  };

  const createList = () => {
    const newList: Note = {
      id: generateUUID(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: '#ffffff',
      fontSize: settings.globalFontSize,
      isSelected: false,
      tags: [],
      type: 'list',
      listItems: [],
    };
    setNotes([newList, ...notes]);
  };

  const createEditor = () => {
    setEditingNote(undefined);
    setViewMode('editing');
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ));
  };

  const saveEditorNote = (note: Note) => {
    if (editingNote) {
      updateNote(note);
    } else {
      setNotes([note, ...notes]);
    }
    setViewMode('all');
    setEditingNote(undefined);
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find(note => note.id === id);
    if (noteToDelete) {
      // Перемещаем в корзину
      const trashedNote = {
        ...noteToDelete,
        deletedAt: new Date().toISOString()
      };
      setTrashedNotes([trashedNote, ...trashedNotes]);
      setNotes(notes.filter(note => note.id !== id));
      toast({
        title: "Заметка перемещена в корзину",
        description: "Заметка была перемещена в корзину и может быть восстановлена",
      });
    }
  };

  const restoreNote = (id: string) => {
    const noteToRestore = trashedNotes.find(note => note.id === id);
    if (noteToRestore) {
      const restoredNote = {
        ...noteToRestore,
        deletedAt: undefined,
        updatedAt: new Date().toISOString()
      };
      setNotes([restoredNote, ...notes]);
      setTrashedNotes(trashedNotes.filter(note => note.id !== id));
      toast({
        title: "Заметка восстановлена",
        description: "Заметка была успешно восстановлена из корзины",
      });
    }
  };

  const deletePermanently = (id: string) => {
    setTrashedNotes(trashedNotes.filter(note => note.id !== id));
    toast({
      title: "Заметка удалена навсегда",
      description: "Заметка была окончательно удалена",
      variant: "destructive",
    });
  };

  const emptyTrash = () => {
    setTrashedNotes([]);
    toast({
      title: "Корзина очищена",
      description: "Все документы были окончательно удалены",
      variant: "destructive",
    });
  };

  const toggleSelectNote = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, isSelected: !note.isSelected } : note
    ));
  };

  const handleReorderNotes = (draggedId: string, targetId: string) => {
    const draggedIndex = notes.findIndex(note => note.id === draggedId);
    const targetIndex = notes.findIndex(note => note.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newNotes = [...notes];
    const [draggedNote] = newNotes.splice(draggedIndex, 1);
    newNotes.splice(targetIndex, 0, draggedNote);
    
    setNotes(newNotes);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const handleImportNotes = async (file: File) => {
    try {
      const importedNotes = await importNotes(file);
      const notesWithNewIds = importedNotes.map(note => ({
        ...note,
        id: generateUUID(),
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSelected: false,
        tags: note.tags || [],
        type: note.type || 'note' as const,
      }));
      setNotes([...notesWithNewIds, ...notes]);
      toast({
        title: "Импорт завершён",
        description: `Импортировано заметок: ${importedNotes.length}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка импорта",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    }
  };

  const handleExportAllNotes = async () => {
    try {
      await exportNotes(notes);
      toast({
        title: "Экспорт завершён",
        description: "Все заметки экспортированы",
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать заметки",
        variant: "destructive",
      });
    }
  };

  const sortedNotes = settings.sortBy === 'manual' ? notes : [...notes].sort((a, b) => {
    if (settings.sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (settings.sortBy === 'title') {
      return a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' });
    } else if (settings.sortBy === 'tags') {
      const aTagString = a.tags?.join(' ') || '';
      const bTagString = b.tags?.join(' ') || '';
      return aTagString.localeCompare(bTagString, 'ru', { sensitivity: 'base' });
    } else if (settings.sortBy === 'type') {
      const typeOrder = { 'list': 0, 'note': 1, 'editor': 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    } else if (settings.sortBy === 'color') {
      return a.color.localeCompare(b.color);
    }
    return 0;
  });

  const selectedNotes = notes.filter(note => note.isSelected);
  const selectedCount = selectedNotes.length;
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));

  const handleExportSelected = async () => {
    if (selectedNotes.length === 0) return;
    
    try {
      await exportNotes(selectedNotes, `selected_notes_${selectedNotes.length}.json`);
      toast({
        title: "Экспорт завершён",
        description: `Экспортировано заметок: ${selectedNotes.length}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать выбранные заметки",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedNotes.length === 0) return;
    
    const updatedNotes = notes.filter(note => !note.isSelected);
    setNotes(updatedNotes);
    toast({
      title: "Заметки удалены",
      description: `Удалено заметок: ${selectedNotes.length}`,
    });
  };

  const handleModeSelect = (mode: 'notes' | 'tasks' | 'editor' | 'all' | 'settings' | 'trash') => {
    if (mode === 'editor') {
      createEditor();
    } else {
      setViewMode(mode);
      setActiveTagFilter(null); // Reset tag filter when changing modes
    }
  };

  const handleEditNote = (note: Note) => {
    if (note.type === 'editor') {
      setEditingNote(note);
      setViewMode('editing');
    }
  };

  const handleTagFilter = (tag: string | null) => {
    setActiveTagFilter(tag);
  };

  const getFilteredNotes = () => {
    let filtered = sortedNotes;
    
    // Filter by view mode
    switch (viewMode) {
      case 'notes':
        filtered = filtered.filter(note => note.type === 'note');
        break;
      case 'tasks':
        filtered = filtered.filter(note => note.type === 'list');
        break;
      case 'all':
        // Show all
        break;
      default:
        break;
    }
    
    // Filter by active tag
    if (activeTagFilter) {
      filtered = filtered.filter(note => note.tags?.includes(activeTagFilter));
    }
    
    return filtered;
  };

  const handleSearchQuery = (query: string) => {
    // Handle search functionality if needed
    console.log('Search query:', query);
  };

  if (viewMode === 'selector') {
    return (
      <div className="min-h-screen bg-background">
        <ModeSelector onSelectMode={handleModeSelect} />
      </div>
    );
  }

  if (viewMode === 'editing') {
    return (
      <EditorPage
        onBack={() => setViewMode('selector')}
        onSave={saveEditorNote}
        existingNote={editingNote}
      />
    );
  }

  if (viewMode === 'settings') {
    return (
      <SettingsPage
        onBack={() => setViewMode('selector')}
        settings={settings}
        onSettingsChange={updateSettings}
        onImportNotes={handleImportNotes}
        onExportAllNotes={handleExportAllNotes}
      />
    );
  }

  if (viewMode === 'trash') {
    return (
      <TrashPage
        onBack={() => setViewMode('selector')}
        trashedNotes={trashedNotes}
        onRestore={restoreNote}
        onDeletePermanently={deletePermanently}
        onEmptyTrash={emptyTrash}
        trashRetentionDays={settings.trashRetentionDays || 7}
      />
    );
  }

  const filteredNotes = getFilteredNotes();
  const isTaskView = viewMode === 'tasks';

  return (
    <div className="min-h-screen bg-background">
      <Header
        mode={viewMode}
        onBack={() => setViewMode('selector')}
        onAddNote={createNote}
        onAddTask={createList}
        onAddEditor={createEditor}
        onSettings={() => setViewMode('settings')}
        onSearch={handleSearchQuery}
        searchQuery=""
        onSortChange={(sortBy) => updateSettings({ sortBy })}
        currentSort={settings.sortBy}
        allTags={allTags}
        onTagSearch={handleTagFilter}
        selectedTag={activeTagFilter}
        onClearTagSearch={() => setActiveTagFilter(null)}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {selectedCount > 0 && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">
              Выбрано {isTaskView ? 'списков' : 'заметок'}: {selectedCount}
            </p>
          </div>
        )}

        {activeTagFilter && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Показаны документы с тегом: "{activeTagFilter}"
            </p>
          </div>
        )}
        
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {activeTagFilter ? '🏷️' : 
               isTaskView ? '📋' : viewMode === 'notes' ? '📝' : '📁'}
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {activeTagFilter ? `Нет документов с тегом "${activeTagFilter}"` :
               isTaskView ? 'Пока нет списков задач' : 
               viewMode === 'notes' ? 'Пока нет заметок' : 'Пока нет документов'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {activeTagFilter ? 'Попробуйте выбрать другой тег или создать новый документ' :
               isTaskView ? 'Создайте свой первый список задач' :
               viewMode === 'notes' ? 'Создайте свою первую заметку' : 'Создайте свой первый документ'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={updateNote}
                onDelete={deleteNote}
                onToggleSelect={toggleSelectNote}
                onReorder={handleReorderNotes}
                onEdit={handleEditNote}
                globalFontSize={settings.globalFontSize}
                allTags={allTags}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

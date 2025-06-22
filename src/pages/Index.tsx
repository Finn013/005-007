import React, { useEffect, useState } from 'react';
import { generateUUID } from '../utils/idGenerator';
import Header from '../components/Header';
import NoteCard from '../components/NoteCard';
import ModeSelector from '../components/ModeSelector';
import EditorPage from '../components/EditorPage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Note, AppSettings } from '../types/note';
import { exportNotes, importNotes } from '../utils/exportUtils';
import { toast } from '@/hooks/use-toast';

const defaultSettings: AppSettings = {
  theme: 'light',
  globalFontSize: 'medium',
  sortBy: 'date',
};

type ViewMode = 'selector' | 'notes' | 'editor' | 'all' | 'editing';

const Index = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('sticky-notes', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', defaultSettings);
  const [viewMode, setViewMode] = useState<ViewMode>('selector');
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  useEffect(() => {
    document.documentElement.className = settings.theme;
  }, [settings.theme]);

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
    setNotes(notes.filter(note => note.id !== id));
    toast({
      title: "Заметка удалена",
      description: "Заметка была успешно удалена",
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

  const handleModeSelect = (mode: 'notes' | 'editor' | 'all') => {
    if (mode === 'editor') {
      createEditor();
    } else {
      setViewMode(mode);
    }
  };

  const handleEditNote = (note: Note) => {
    if (note.type === 'editor') {
      setEditingNote(note);
      setViewMode('editing');
    }
  };

  const getFilteredNotes = () => {
    switch (viewMode) {
      case 'notes':
        return sortedNotes.filter(note => note.type === 'note' || note.type === 'list');
      case 'all':
        return sortedNotes;
      default:
        return sortedNotes;
    }
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

  const filteredNotes = getFilteredNotes();

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreateNote={createNote}
        onCreateList={createList}
        onCreateEditor={createEditor}
        settings={settings}
        onSettingsChange={updateSettings}
        onImportNotes={handleImportNotes}
        onExportAllNotes={handleExportAllNotes}
        selectedCount={selectedCount}
        onExportSelected={handleExportSelected}
        onDeleteSelected={handleDeleteSelected}
        onBack={() => setViewMode('selector')}
        showBackButton={true}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {selectedCount > 0 && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">
              Выбрано заметок: {selectedCount}
            </p>
          </div>
        )}
        
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Пока нет заметок
            </h2>
            <p className="text-muted-foreground mb-6">
              Создайте свою первую заметку или список, нажав кнопку "Создать"
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

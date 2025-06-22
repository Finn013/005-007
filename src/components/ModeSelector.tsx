
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StickyNote, Edit3, FolderOpen } from 'lucide-react';

interface ModeSelectorProps {
  onSelectMode: (mode: 'notes' | 'editor' | 'all') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Заметки и Редактор
        </h1>
        <p className="text-muted-foreground">
          Выберите режим работы с документами
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <StickyNote size={32} className="text-primary" />
            </div>
            <CardTitle>Быстрые заметки</CardTitle>
            <CardDescription>
              Создавайте простые заметки и списки задач
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('notes')} 
              className="w-full"
            >
              Открыть заметки
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Edit3 size={32} className="text-primary" />
            </div>
            <CardTitle>Текстовый редактор</CardTitle>
            <CardDescription>
              Создавайте документы с форматированием
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('editor')} 
              className="w-full"
            >
              Открыть редактор
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <FolderOpen size={32} className="text-primary" />
            </div>
            <CardTitle>Все документы</CardTitle>
            <CardDescription>
              Просматривайте все заметки и документы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('all')} 
              className="w-full"
              variant="outline"
            >
              Показать все
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeSelector;

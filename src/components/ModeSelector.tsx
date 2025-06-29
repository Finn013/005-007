
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StickyNote, Edit3, FolderOpen, CheckSquare, Settings } from 'lucide-react';

interface ModeSelectorProps {
  onSelectMode: (mode: 'notes' | 'tasks' | 'editor' | 'all' | 'settings') => void;
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
              <CheckSquare size={32} className="text-yellow-600" />
            </div>
            <CardTitle>Списки задач</CardTitle>
            <CardDescription>
              Создавайте и ведите списки дел
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('tasks')} 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Открыть списки
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
              <StickyNote size={32} className="text-orange-600" />
            </div>
            <CardTitle>Быстрые заметки</CardTitle>
            <CardDescription>
              Создавайте простые текстовые заметки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('notes')} 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Открыть заметки
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <Edit3 size={32} className="text-green-600" />
            </div>
            <CardTitle>Текстовый редактор</CardTitle>
            <CardDescription>
              Создавайте документы с форматированием
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('editor')} 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Открыть редактор
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <FolderOpen size={32} className="text-purple-600" />
            </div>
            <CardTitle>Все документы</CardTitle>
            <CardDescription>
              Просматривайте все заметки и документы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('all')} 
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              variant="outline"
            >
              Показать все
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button 
          onClick={() => onSelectMode('settings')} 
          className="bg-gray-700 hover:bg-gray-800 text-white px-8"
        >
          <Settings size={16} className="mr-2" />
          Общие настройки
        </Button>
      </div>
    </div>
  );
};

export default ModeSelector;

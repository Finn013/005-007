
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StickyNote, Edit3, FolderOpen, CheckSquare, Settings, Trash2 } from 'lucide-react';

interface ModeSelectorProps {
  onSelectMode: (mode: 'notes' | 'tasks' | 'editor' | 'all' | 'settings' | 'trash') => void;
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
        <Card className="mode-card-tasks cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-green-50/50 border-3 border-green-300 shadow-green-200 shadow-lg glow-green">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckSquare size={32} className="text-green-600" />
            </div>
            <CardTitle>Списки задач</CardTitle>
            <CardDescription>
              Создавайте и ведите списки дел
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('tasks')} 
              className="w-full bg-green-500 hover:bg-green-600 text-white border-3 border-green-600"
            >
              Открыть списки
            </Button>
          </CardContent>
        </Card>

        <Card className="mode-card-notes cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-blue-50/50 border-3 border-blue-300 shadow-blue-200 shadow-lg glow-blue">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <StickyNote size={32} className="text-blue-600" />
            </div>
            <CardTitle>Быстрые заметки</CardTitle>
            <CardDescription>
              Создавайте простые текстовые заметки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('notes')} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white border-3 border-blue-600"
            >
              Открыть заметки
            </Button>
          </CardContent>
        </Card>

        <Card className="mode-card-editor cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-purple-50/50 border-3 border-purple-300 shadow-purple-200 shadow-lg glow-purple">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <Edit3 size={32} className="text-purple-600" />
            </div>
            <CardTitle>Текстовый редактор</CardTitle>
            <CardDescription>
              Создавайте документы с форматированием
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('editor')} 
              className="w-full bg-purple-500 hover:bg-purple-600 text-white border-3 border-purple-600"
            >
              Открыть документы
            </Button>
          </CardContent>
        </Card>

        <Card className="mode-card-all cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-orange-50/50 border-3 border-orange-300 shadow-orange-200 shadow-lg glow-orange">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
              <FolderOpen size={32} className="text-orange-600" />
            </div>
            <CardTitle>Все документы</CardTitle>
            <CardDescription>
              Просматривайте все заметки и документы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('all')} 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white border-3 border-orange-600"
            >
              Показать все
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button 
          onClick={() => onSelectMode('settings')} 
          className="bg-gray-700 hover:bg-gray-800 text-white px-8 border-3 border-gray-800"
        >
          <Settings size={16} className="mr-2" />
          Общие настройки
        </Button>
        <Button 
          onClick={() => onSelectMode('trash')} 
          className="bg-red-600 hover:bg-red-700 text-white px-8 border-3 border-red-700"
        >
          <Trash2 size={16} className="mr-2" />
          Корзина
        </Button>
      </div>
    </div>
  );
};

export default ModeSelector;

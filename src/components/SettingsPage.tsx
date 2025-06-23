
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Upload, Info, User } from 'lucide-react';
import { AppSettings } from '../types/note';

interface SettingsPageProps {
  onBack: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  onImportNotes: (file: File) => void;
  onExportAllNotes: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  settings,
  onSettingsChange,
  onImportNotes,
  onExportAllNotes
}) => {
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportNotes(file);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft size={16} />
            Назад
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-8">Общие настройки</h1>

        <div className="space-y-6">
          {/* Размер шрифта */}
          <Card>
            <CardHeader>
              <CardTitle>Размер шрифта интерфейса</CardTitle>
              <CardDescription>Выберите размер шрифта для всего интерфейса</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={settings.globalFontSize === 'small' ? 'default' : 'outline'}
                  onClick={() => onSettingsChange({ globalFontSize: 'small' })}
                >
                  Маленький
                </Button>
                <Button
                  variant={settings.globalFontSize === 'medium' ? 'default' : 'outline'}
                  onClick={() => onSettingsChange({ globalFontSize: 'medium' })}
                >
                  Средний
                </Button>
                <Button
                  variant={settings.globalFontSize === 'large' ? 'default' : 'outline'}
                  onClick={() => onSettingsChange({ globalFontSize: 'large' })}
                >
                  Большой
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Тема */}
          <Card>
            <CardHeader>
              <CardTitle>Тема оформления</CardTitle>
              <CardDescription>Выберите светлую или тёмную тему</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={settings.theme === 'light' ? 'default' : 'outline'}
                  onClick={() => onSettingsChange({ theme: 'light' })}
                  className="gap-2"
                >
                  ☀️ Светлая
                </Button>
                <Button
                  variant={settings.theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => onSettingsChange({ theme: 'dark' })}
                  className="gap-2"
                >
                  🌙 Тёмная
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Импорт/Экспорт */}
          <Card>
            <CardHeader>
              <CardTitle>Импорт и экспорт дан ных</CardTitle>
              <CardDescription>Сохраните свои заметки или загрузите резервную копию</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={onExportAllNotes} className="gap-2">
                  <Download size={16} />
                  Экспорт всех заметок
                </Button>
                <Button variant="outline" asChild>
                  <label className="cursor-pointer gap-2">
                    <Upload size={16} />
                    Импорт заметок
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Информация о приложении */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о приложении</CardTitle>
              <CardDescription>Подробности о приложении и его использовании</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Info size={16} />
                  Как использовать
                </h4>
                <p className="text-sm text-muted-foreground">
                  • Создавайте быстрые заметки для записи идей<br />
                  • Ведите списки задач с возможностью отмечать выполненные<br />
                  • Используйте текстовый редактор для форматированных документов<br />
                  • Экспортируйте данные для резервного копирования
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Структура</h4>
                <p className="text-sm text-muted-foreground">
                  Приложение построено на React с использованием TypeScript, 
                  Tailwind CSS и shadcn/ui компонентов. Все данные хранятся 
                  локально в браузере.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Технологии</h4>
                <p className="text-sm text-muted-foreground">
                  React, TypeScript, Tailwind CSS, Vite, shadcn/ui
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <User size={16} />
                  Разработчик
                </h4>
                <p className="text-sm text-muted-foreground">
                  Nott
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

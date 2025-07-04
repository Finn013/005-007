
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Upload, Info, User, Trash2 } from 'lucide-react';
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

          {/* Настройки корзины */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 size={20} />
                Настройки корзины
              </CardTitle>
              <CardDescription>Время хранения удаленных документов</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={settings.trashRetentionDays?.toString() || '7'}
                onValueChange={(value) => onSettingsChange({ trashRetentionDays: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите время хранения" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 день</SelectItem>
                  <SelectItem value="3">3 дня</SelectItem>
                  <SelectItem value="7">7 дней</SelectItem>
                  <SelectItem value="14">14 дней</SelectItem>
                  <SelectItem value="30">30 дней</SelectItem>
                  <SelectItem value="-1">Бессрочно</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Импорт/Экспорт */}
          <Card>
            <CardHeader>
              <CardTitle>Импорт и экспорт данных</CardTitle>
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
                  Возможности приложения
                </h4>
                <p className="text-sm text-muted-foreground">
                  • <strong>Быстрые заметки</strong> - создание простых текстовых заметок с тегами и цветовой маркировкой<br />
                  • <strong>Списки задач</strong> - интерактивные списки с возможностью отмечать выполненные пункты<br />
                  • <strong>Markdown редактор</strong> - полноценный редактор с поддержкой форматирования, таблиц, ссылок и изображений<br />
                  • <strong>Умная корзина</strong> - безопасное удаление с возможностью восстановления<br />
                  • <strong>Экспорт/импорт</strong> - резервное копирование в форматах JSON, HTML, TXT, MD<br />
                  • <strong>Визуальная дифференциация</strong> - цветные обводки и свечение для разных типов документов
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Архитектура</h4>
                <p className="text-sm text-muted-foreground">
                  Приложение построено на современной архитектуре с использованием:
                  React 18 + TypeScript для типобезопасности, Tailwind CSS для стилизации,
                  shadcn/ui для UI компонентов, EasyMDE для Markdown редактирования.
                  Все данные хранятся локально в браузере с автоматическим сохранением.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Технологический стек</h4>
                <p className="text-sm text-muted-foreground">
                  React 18, TypeScript, Tailwind CSS, Vite, shadcn/ui, EasyMDE, 
                  Lucide Icons, date-fns для работы с датами
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Особенности редактора</h4>
                <p className="text-sm text-muted-foreground">
                  Полная поддержка Markdown синтаксиса, HTML с inline-стилями,
                  предпросмотр в реальном времени, полноэкранный режим,
                  режим бок о бок, автосохранение, подсветка синтаксиса,
                  вставка символов и эмодзи, цветовое выделение текста
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <User size={16} />
                  Разработчик
                </h4>
                <p className="text-sm text-muted-foreground">
                  Nott_013 - Система заметок и документооборота v2.0
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

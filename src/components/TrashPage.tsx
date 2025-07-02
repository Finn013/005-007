
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { Note } from '../types/note';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TrashPageProps {
  onBack: () => void;
  trashedNotes: Note[];
  onRestore: (noteId: string) => void;
  onDeletePermanently: (noteId: string) => void;
  onEmptyTrash: () => void;
  trashRetentionDays: number;
}

const TrashPage: React.FC<TrashPageProps> = ({
  onBack,
  trashedNotes,
  onRestore,
  onDeletePermanently,
  onEmptyTrash,
  trashRetentionDays
}) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'note': return 'Заметка';
      case 'list': return 'Список';
      case 'editor': return 'Документ';
      default: return 'Документ';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'bg-blue-100 text-blue-800';
      case 'list': return 'bg-green-100 text-green-800';
      case 'editor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft size={16} />
            Назад
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Корзина
          </h1>
          <p className="text-muted-foreground">
            Удаленные документы хранятся {trashRetentionDays === -1 ? 'бессрочно' : `${trashRetentionDays} дн.`}
          </p>
        </div>

        {trashedNotes.length > 0 && (
          <div className="mb-4">
            <Button 
              onClick={onEmptyTrash} 
              variant="destructive" 
              className="gap-2"
            >
              <Trash2 size={16} />
              Очистить корзину
            </Button>
          </div>
        )}

        {trashedNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗑️</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Корзина пуста
            </h2>
            <p className="text-muted-foreground">
              Удаленные документы будут появляться здесь
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {trashedNotes.map(note => (
              <Card key={note.id} className="border-2 border-red-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {note.title || 'Без названия'}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                          {getTypeLabel(note.type)}
                        </span>
                        {note.deletedAt && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            Удалено {formatDistanceToNow(new Date(note.deletedAt), { addSuffix: true, locale: ru })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRestore(note.id)}
                        className="gap-1"
                      >
                        <RotateCcw size={14} />
                        Восстановить
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeletePermanently(note.id)}
                        className="gap-1"
                      >
                        <Trash2 size={14} />
                        Удалить навсегда
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {note.content || 'Нет содержимого'}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-2 text-yellow-800">
            <AlertTriangle size={16} className="mt-1 flex-shrink-0" />
            <div className="text-sm">
              <strong>Внимание:</strong> Документы в корзине будут автоматически удалены через {trashRetentionDays === -1 ? 'неограниченное время' : `${trashRetentionDays} дней`}. 
              Время хранения можно изменить в общих настройках.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrashPage;

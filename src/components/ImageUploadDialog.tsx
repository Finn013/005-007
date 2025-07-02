
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, Upload } from 'lucide-react';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage: (imageData: string, altText: string) => void;
}

const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({ 
  open, 
  onOpenChange, 
  onInsertImage 
}) => {
  const [altText, setAltText] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onInsertImage(imageData, altText || 'Загруженное изображение');
        onOpenChange(false);
        setAltText('');
        setImageUrl('');
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };

  const handleUrlInsert = () => {
    if (imageUrl.trim()) {
      onInsertImage(imageUrl.trim(), altText || 'Изображение');
      onOpenChange(false);
      setAltText('');
      setImageUrl('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить изображение</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="altText">Описание изображения</Label>
            <Input
              id="altText"
              placeholder="Описание изображения"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Загрузить с устройства</Label>
            <Button
              variant="outline"
              asChild
              className="w-full gap-2"
            >
              <label className="cursor-pointer">
                <Upload size={16} />
                Выбрать файл
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Или введите URL</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleUrlInsert} disabled={!imageUrl.trim()}>
            <Image size={16} className="mr-2" />
            Добавить по URL
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;

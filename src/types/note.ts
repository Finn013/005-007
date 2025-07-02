
export interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  htmlContent?: string;
  markdownContent?: string;
  editorType?: 'markdown' | 'rich';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // Дата удаления для корзины
  color: string;
  fontSize: 'small' | 'medium' | 'large';
  isSelected: boolean;
  tags?: string[];
  type: 'note' | 'list' | 'editor';
  listItems?: ListItem[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  globalFontSize: 'small' | 'medium' | 'large';
  sortBy: 'date' | 'title' | 'tags' | 'type' | 'color' | 'manual';
  trashRetentionDays?: number; // -1 для бессрочного хранения
}


export interface Note {
  id: string;
  title: string;
  content: string;
  htmlContent?: string;
  markdownContent?: string;
  editorType?: 'rich' | 'markdown';
  createdAt: string;
  updatedAt: string;
  color: string;
  fontSize: 'small' | 'medium' | 'large';
  isSelected: boolean;
  tags?: string[];
  type: 'note' | 'list' | 'editor';
  listItems?: ListItem[];
}

export interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  order?: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  globalFontSize: 'small' | 'medium' | 'large';
  sortBy: 'date' | 'title' | 'manual' | 'tags' | 'type' | 'color';
}

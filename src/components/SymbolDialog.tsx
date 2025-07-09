import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SymbolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertSymbol: (symbol: string) => void;
}

const SymbolDialog: React.FC<SymbolDialogProps> = ({
  open,
  onOpenChange,
  onInsertSymbol
}) => {
  const basicSymbols = [
    '★', '☆', '✓', '✗', '✕', '⚠️', '🔥', '💡', '📝', '📋',
    '⭐', '💯', '🎯', '🚀', '⚡', '🔔', '❤️', '👍', '👎', '🎉',
    '→', '←', '↑', '↓', '⇒', '⇐', '↔️', '⇔️', '➡️', '⬅️'
  ];

  const mathSymbols = [
    '±', '∞', '≈', '≠', '≤', '≥', '∑', '∏', '√', '∆', 
    '∇', '∂', '∫', 'π', 'α', 'β', 'γ', 'δ', 'θ', 'λ',
    'μ', 'σ', 'φ', 'ψ', 'ω', '°', '′', '″', '∴', '∵'
  ];

  const currencySymbols = [
    '$', '€', '£', '¥', '₽', '₴', '₿', '¢', '₹', '₩',
    '₡', '₦', '₨', '₱', '₪', '₫'
  ];

  const specialSymbols = [
    '©', '®', '™', '°', '§', '¶', '†', '‡', '…', '•', 
    '‰', '№', '℃', '℉', '℮', '℠', '⌘', '⌥', '⌫', '⌦',
    '⏎', '⎋', '⇧', '⇪', '⇥', '␣', '⟨', '⟩', '‹', '›'
  ];

  const handleSymbolClick = (symbol: string) => {
    onInsertSymbol(symbol);
    onOpenChange(false);
  };

  const SymbolGrid = ({ symbols, title }: { symbols: string[], title: string }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <div className="grid grid-cols-8 gap-2">
        {symbols.map((symbol) => (
          <Button
            key={symbol}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-lg hover:bg-primary hover:text-primary-foreground"
            onClick={() => handleSymbolClick(symbol)}
          >
            {symbol}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выберите символ для вставки</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <SymbolGrid symbols={basicSymbols} title="Основные символы" />
          <SymbolGrid symbols={mathSymbols} title="Математические символы" />
          <SymbolGrid symbols={currencySymbols} title="Валюты" />
          <SymbolGrid symbols={specialSymbols} title="Специальные символы" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SymbolDialog;
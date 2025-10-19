import { Button } from '@/components/ui/button';

type ViewToggleProps = {
  viewMode: 'raw' | 'final';
  onToggle: (mode: 'raw' | 'final') => void;
};

export default function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={viewMode === 'raw' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onToggle('raw')}
        className="flex-1"
      >
        原始成績
      </Button>
      <Button
        variant={viewMode === 'final' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onToggle('final')}
        className="flex-1"
      >
        課堂參與換算
      </Button>
    </div>
  );
}


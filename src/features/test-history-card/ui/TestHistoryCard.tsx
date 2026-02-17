import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Calendar, FileText, GitBranch, Award, Target, ClipboardList } from 'lucide-react';
import type { TestHistoryItem } from '../../../entities/ai-test';

interface TestHistoryCardProps {
  item: TestHistoryItem;
  onClick: (item: TestHistoryItem) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'a3': FileText,
  'vsm': GitBranch,
  'qfd': Award,
  'hoshin': Target,
  'custom': ClipboardList,
};

export function TestHistoryCard({ item, onClick }: TestHistoryCardProps) {
  const formattedDate = new Date(item.created_at).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const IconComponent = ICON_MAP[item.type] || ClipboardList;
  
  // Получаем заголовок из data в зависимости от типа отчета
  const getTitle = (): string => {
    switch (item.type) {
      case 'a3':
      case 'vsm':
      case 'hoshin':
        // Эти типы имеют поле title
        return item.data?.title || 'Отчет';
      case 'qfd':
        // QFD имеет productName
        return item.data?.productName || 'QFD отчет';
      case 'custom':
        // Custom тесты могут иметь разные поля
        return item.data?.templateTitle || item.data?.prompt || 'Пользовательский тест';
      default:
        return 'Тест';
    }
  };

  const title = getTitle();

  return (
    <Card 
      className="cursor-pointer hover:bg-accent transition-colors p-4"
      onClick={() => onClick(item)}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary max-w-full truncate">
              {title}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
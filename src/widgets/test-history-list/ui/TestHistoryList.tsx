import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { AlertCircle, Inbox } from 'lucide-react';
import { TestHistoryCard } from '../../../features/test-history-card';
import type { TestHistoryItem } from '../../../entities/ai-test';

interface TestHistoryListProps {
  history: TestHistoryItem[];
  isLoading: boolean;
  onViewResult: (item: TestHistoryItem) => void;
}

export function TestHistoryList({ history, isLoading, onViewResult }: TestHistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Inbox className="h-12 w-12 mb-4" />
        <p>История пуста</p>
        <p className="text-sm mt-1">Пройдите первый тест</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <TestHistoryCard
          key={item.id}
          item={item}
          onClick={onViewResult}
        />
      ))}
    </div>
  );
}
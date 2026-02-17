import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { TestHistoryList } from '../../../widgets/test-history-list';
import { getTestHistory } from '../../../entities/ai-test';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { TestHistoryItem } from '../../../entities/ai-test';
import type { Route } from '../../../app/routing/useRouter';

interface TestHistoryPageProps {
  navigate: (route: Route, params?: Record<string, string>) => void;
}

export function TestHistoryPage({ navigate }: TestHistoryPageProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<TestHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTestHistory(user.id, user.role);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить историю тестов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResult = (item: TestHistoryItem) => {
    // Отладка: выводим полные данные
    console.log('Клик на историю:', {
      type: item.type,
      hasData: !!item.data,
      dataKeys: item.data ? Object.keys(item.data) : [],
      id: item.data?.id,
      fullData: item.data
    });

    // Навигация в зависимости от типа отчета
    // ID берем из data (тот же объект что в KV store)
    switch (item.type) {
      case 'a3':
        if (item.data?.id) {
          console.log('Переход на A3 отчет:', item.data.id);
          navigate('view-report', { id: item.data.id });
        } else {
          console.error('Нет ID для A3 отчета');
          alert('Ошибка: не найден ID отчета');
        }
        break;
        
      case 'vsm':
        if (item.data?.id) {
          console.log('Переход на VSM:', item.data.id);
          navigate('view-vsm', { id: item.data.id });
        } else {
          console.error('Нет ID для VSM');
          alert('Ошибка: не найден ID VSM');
        }
        break;
        
      case 'qfd':
        if (item.data?.id) {
          console.log('Переход на QFD:', item.data.id);
          navigate('view-qfd', { id: item.data.id });
        } else {
          console.error('Нет ID для QFD');
          alert('Ошибка: не найден ID QFD');
        }
        break;
        
      case 'hoshin':
        if (item.data?.id) {
          console.log('Переход на Hoshin:', item.data.id);
          navigate('view-hoshin', { id: item.data.id });
        } else {
          console.error('Нет ID для Hoshin');
          alert('Ошибка: не найден ID Hoshin');
        }
        break;
        
      case 'custom':
        // Для кастомных тестов пока просто логируем
        // TODO: Создать страницу просмотра кастомных тестов
        alert('Просмотр результатов кастомных тестов скоро будет добавлен');
        break;
        
      default:
        console.error('Неизвестный тип отчета:', item.type);
        alert('Ошибка: неизвестный тип отчета');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1>История тестов</h1>
        <p className="text-muted-foreground">
          Все пройденные тесты и их результаты
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TestHistoryList
        history={history}
        isLoading={isLoading}
        onViewResult={handleViewResult}
      />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Loader2 } from 'lucide-react';
import { getAllVsm } from '../../../entities/vsm';
import type { ValueStreamMap } from '../../../entities/vsm';

interface VsmPageProps {
  onCreateNew?: () => void;
  onViewMap?: (id: string) => void;
}

export function VsmPage({ onCreateNew, onViewMap }: VsmPageProps) {
  const [maps, setMaps] = useState<ValueStreamMap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      setLoading(true);
      const data = await getAllVsm();
      setMaps(data);
    } catch (error) {
      console.error('Ошибка загрузки карт потока:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {maps.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Пока нет карт потока создания ценно��ти
          </p>
          {onCreateNew && (
            <Button onClick={onCreateNew} variant="outline" className="mt-4">
              Создать первую карту
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <div key={map.id} className="rounded-lg border p-6 hover:shadow-md transition-shadow">
              <h3 className="mb-2">{map.title}</h3>
              {map.description && (
                <p className="text-sm text-muted-foreground mb-4">{map.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Создано: {new Date(map.createdAt).toLocaleDateString('ru-RU')}
              </p>
              {onViewMap && (
                <Button
                  onClick={() => onViewMap(map.id)}
                  variant="outline"
                  className="mt-4"
                >
                  Просмотреть
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
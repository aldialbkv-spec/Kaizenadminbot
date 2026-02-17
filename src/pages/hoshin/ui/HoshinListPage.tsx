import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { getHoshinReports, deleteHoshinReport } from '../../../shared/api/hoshinApi';
import type { HoshinReport } from '../../../entities/hoshin-report';
import { toast } from 'sonner@2.0.3';

interface HoshinListPageProps {
  onCreateNew?: () => void;
  onViewReport?: (id: string) => void;
}

export function HoshinListPage({ onCreateNew, onViewReport }: HoshinListPageProps) {
  const [reports, setReports] = useState<HoshinReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getHoshinReports();
      setReports(data);
    } catch (error) {
      console.error('Ошибка загрузки отчетов Hoshin Kanri:', error);
      toast.error('Не удалось загрузить отчеты');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Вы уверены, что хотите удалить этот отчет?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteHoshinReport(id);
      setReports(reports.filter((r) => r.id !== id));
      toast.success('Отчет удален');
    } catch (error) {
      console.error('Ошибка удаления отчета:', error);
      toast.error('Не удалось удалить отчет');
    } finally {
      setDeletingId(null);
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
      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Пока нет отчетов Hoshin Kanri
          </p>
          {onCreateNew && (
            <Button onClick={onCreateNew} variant="outline" className="mt-4">
              Создать первый отчет
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer relative group"
              onClick={() => onViewReport?.(report.id)}
            >
              <h3 className="mb-2">{report.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Создано: {new Date(report.createdAt).toLocaleDateString('ru-RU')}
              </p>
              <div className="flex items-center justify-between mt-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewReport?.(report.id);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Просмотреть
                </Button>
                <Button
                  onClick={(e) => handleDelete(report.id, e)}
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === report.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {deletingId === report.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

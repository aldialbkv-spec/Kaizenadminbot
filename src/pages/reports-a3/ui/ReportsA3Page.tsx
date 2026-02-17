import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { getAllA3Reports, deleteA3Report } from '../../../entities/a3-report';
import type { A3Report } from '../../../entities/a3-report';

interface ReportsA3PageProps {
  onCreateReport: () => void;
  onViewReport: (id: string) => void;
}

export function ReportsA3Page({ onCreateReport, onViewReport }: ReportsA3PageProps) {
  const [reports, setReports] = useState<A3Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllA3Reports();
      setReports(data);
    } catch (err) {
      console.error('Error loading A3 reports:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить отчеты');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отчет?')) {
      return;
    }

    try {
      await deleteA3Report(id);
      setReports((prev) => prev.filter((report) => report.id !== id));
    } catch (err) {
      console.error('Error deleting A3 report:', err);
      alert('Не удалось удалить отчет');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Ошибка</p>
          <p className="text-sm">{error}</p>
          <Button onClick={loadReports} variant="outline" className="mt-4">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
            <svg className="size-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="mt-6">Нет отчетов A3</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Начните создавать отчеты A3 для структурированного решения проблем и улучшения процессов
          </p>
          <Button onClick={onCreateReport} className="mt-6">
            Создать отчет A3
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => onViewReport(report.id)}
            className="group relative cursor-pointer rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <div className="space-y-3">
              <div>
                <h3 className="line-clamp-2">{report.title || `Отчет #${report.id.slice(0, 8)}`}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{formatDate(report.createdAt)}</p>
              </div>
              
              {report.output && (
                <p className="text-sm text-muted-foreground">
                  Контрмеры: {report.output.countermeasuresPlan.length} действий
                </p>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(report.id);
              }}
              className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
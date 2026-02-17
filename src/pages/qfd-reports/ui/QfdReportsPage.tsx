import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { getAllQFDReports, deleteQFDReport } from '../../../entities/qfd-report';
import type { QFDReport } from '../../../entities/qfd-report';

interface QfdReportsPageProps {
  onCreateReport: () => void;
  onViewReport: (id: string) => void;
}

export function QfdReportsPage({ onCreateReport, onViewReport }: QfdReportsPageProps) {
  const [reports, setReports] = useState<QFDReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllQFDReports();
      // Проверяем, что data это массив
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        console.error('QFD reports API returned non-array:', data);
        setReports([]);
      }
    } catch (err) {
      console.error('Error loading QFD reports:', err);
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
      await deleteQFDReport(id);
      setReports((prev) => prev.filter((report) => report.id !== id));
    } catch (err) {
      console.error('Error deleting QFD report:', err);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="mt-6">Нет отчетов QFD</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Начните создавать отчеты "Дом качества" для структурированного анализа потребностей клиентов и технических характеристик продукта
          </p>
          <Button onClick={onCreateReport} className="mt-6">
            Создать отчет QFD
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(reports) && reports.map((report) => (
          <div
            key={report.id}
            onClick={() => onViewReport(report.id)}
            className="group relative cursor-pointer rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <div className="space-y-3">
              <div>
                <h3 className="line-clamp-2">{report.productName || report.product || `QFD #${report.id.slice(0, 8)}`}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{formatDate(report.createdAt)}</p>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>{report.customerRequirements?.length || 0} требований клиентов</p>
                <p>{report.technicalCharacteristics?.length || 0} технических характеристик</p>
              </div>
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

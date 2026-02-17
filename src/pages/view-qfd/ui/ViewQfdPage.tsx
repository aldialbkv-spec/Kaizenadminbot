import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getQFDReport } from '../../../entities/qfd-report';
import type { QFDReport } from '../../../entities/qfd-report';
import { QfdReportDisplay } from '../../../widgets/qfd-report-display';

interface ViewQfdPageProps {
  reportId: string;
  onBack: () => void;
}

export function ViewQfdPage({ reportId, onBack }: ViewQfdPageProps) {
  const [report, setReport] = useState<QFDReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getQFDReport(reportId);
      setReport(data);
    } catch (err) {
      console.error('Error loading QFD report:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить отчет');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">

      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container mx-auto p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Ошибка</p>
          <p className="text-sm">{error || 'Отчет не найден'}</p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <QfdReportDisplay report={report} />
    </div>
  );
}

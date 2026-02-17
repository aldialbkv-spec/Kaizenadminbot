import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getHoshinReport } from '../../../shared/api/hoshinApi';
import type { HoshinReport } from '../../../entities/hoshin-report';
import { HoshinReportDisplay } from '../../../widgets/hoshin-report-display';
import { toast } from 'sonner@2.0.3';

interface HoshinReportPageProps {
  reportId: string;
  onBack: () => void;
}

export function HoshinReportPage({ reportId, onBack }: HoshinReportPageProps) {
  const [report, setReport] = useState<HoshinReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getHoshinReport(reportId);
      setReport(data);
    } catch (err) {
      console.error('Ошибка загрузки отчета Hoshin Kanri:', err);
      const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить отчет';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
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
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <HoshinReportDisplay report={report} />
    </div>
  );
}

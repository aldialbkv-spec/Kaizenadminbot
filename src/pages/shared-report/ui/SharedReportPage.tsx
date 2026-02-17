import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getA3ReportById } from '../../../entities/a3-report';
import type { A3Report } from '../../../entities/a3-report';
import { A3ReportDisplay } from '../../../widgets/a3-report-display';

interface SharedReportPageProps {
  reportId: string;
}

export function SharedReportPage({ reportId }: SharedReportPageProps) {
  const [report, setReport] = useState<A3Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await getA3ReportById(reportId);
      setReport(data);
    } catch (error) {
      console.error('Ошибка загрузки отчета:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!report || !report.output) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="rounded-lg border border-dashed p-8 text-center max-w-md">
          <p className="text-muted-foreground">Отчет не найден или не сгенерирован</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="space-y-6">
          {/* Заголовок отчета */}
          <div className="text-center">
            <h1 className="mb-2">{report.title || `Отчет #${report.id.slice(0, 8)}`}</h1>
            <p className="text-muted-foreground">
              Создан: {new Date(report.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>

          {/* Полный A3 отчет с исходными данными и результатами */}
          <A3ReportDisplay input={report.input} output={report.output} />
        </div>
      </div>
    </div>
  );
}
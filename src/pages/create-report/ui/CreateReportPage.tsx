import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { A3InputForm } from '../../../features/fill-a3-inputs';
import type { A3ReportInput, A3Report, GenerationStatus } from '../../../entities/a3-report';
import { generateA3Report } from '../../../entities/a3-report';
import { A3ReportDisplay } from '../../../widgets/a3-report-display';

interface CreateReportPageProps {
  onBack: () => void;
}

export function CreateReportPage({ onBack }: CreateReportPageProps) {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [report, setReport] = useState<A3Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: A3ReportInput) => {
    setGenerationStatus('loading');
    setError(null);

    try {
      const generatedReport = await generateA3Report(input);
      
      setReport(generatedReport);
      setGenerationStatus('success');
    } catch (err) {
      console.error('Error generating A3 report:', err);
      setGenerationStatus('error');
      setError(err instanceof Error ? err.message : 'Произошла ошибка при генерации отчета');
    }
  };

  const handleCreateNew = () => {
    setReport(null);
    setGenerationStatus('idle');
    setError(null);
  };

  return (
    <div className="container mx-auto p-8">
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Ошибка</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!report && (
        <A3InputForm 
          onSubmit={handleSubmit} 
          isLoading={generationStatus === 'loading'} 
        />
      )}

      {report && report.output && generationStatus === 'success' && (
        <div className="space-y-6">
          {/* Полный A3 отчет с исходными данными и результатами */}
          <A3ReportDisplay input={report.input} output={report.output} />
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCreateNew}>
              Создать новый отчет
            </Button>
            <Button onClick={onBack}>
              К списку отчетов
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
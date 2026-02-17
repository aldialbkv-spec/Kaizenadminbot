import { useState } from 'react';
import { HoshinForm } from '../../../features/hoshin-form';
import { generateHoshinReport } from '../../../shared/api/hoshinApi';
import type { HoshinReportInput } from '../../../entities/hoshin-report';
import { toast } from 'sonner@2.0.3';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface HoshinFormPageProps {
  onNavigateToReport?: (id: string) => void;
  onNavigateBack?: () => void;
}

export function HoshinFormPage({ onNavigateToReport, onNavigateBack }: HoshinFormPageProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (input: HoshinReportInput) => {
    try {
      setIsGenerating(true);
      const report = await generateHoshinReport(input);
      toast.success('Отчет успешно создан');
      onNavigateToReport?.(report.id);
    } catch (error) {
      console.error('Ошибка генерации отчета Hoshin Kanri:', error);
      toast.error('Не удалось сгенерировать отчет');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <HoshinForm onSubmit={handleSubmit} isGenerating={isGenerating} />
    </div>
  );
}

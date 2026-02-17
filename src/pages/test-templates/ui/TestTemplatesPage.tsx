import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { TestTemplatesList } from '../../../widgets/test-templates-list';
import { getTestTemplates } from '../../../entities/ai-test';
import type { TestTemplate } from '../../../entities/ai-test';

interface TestTemplatesPageProps {
  onSelectTemplate: (template: TestTemplate) => void;
  onCreateCustom?: () => void;
  onBack?: () => void;
}

export function TestTemplatesPage({ onSelectTemplate, onCreateCustom, onBack }: TestTemplatesPageProps) {
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTestTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить шаблоны тестов');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1>Тесты</h1>
        <p className="text-muted-foreground">
          Выберите шаблон отчёта для создания
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TestTemplatesList
        templates={templates}
        isLoading={isLoading}
        onSelectTemplate={onSelectTemplate}
      />
    </div>
  );
}
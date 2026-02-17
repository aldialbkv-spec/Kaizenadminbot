import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { TestCard } from '../../../features/test-card';
import type { TestTemplate } from '../../../entities/ai-test';

interface TestTemplatesListProps {
  templates: TestTemplate[];
  isLoading: boolean;
  onSelectTemplate: (template: TestTemplate) => void;
}

export function TestTemplatesList({ templates, isLoading, onSelectTemplate }: TestTemplatesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Нет доступных шаблонов тестов</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TestCard
          key={template.id}
          template={template}
          onClick={onSelectTemplate}
        />
      ))}
    </div>
  );
}
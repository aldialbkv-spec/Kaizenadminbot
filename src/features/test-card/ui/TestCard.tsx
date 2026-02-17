import { Card } from '../../../components/ui/card';
import { FileText, GitBranch, Award, Target } from 'lucide-react';
import type { TestTemplate } from '../../../entities/ai-test';

interface TestCardProps {
  template: TestTemplate;
  onClick: (template: TestTemplate) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'FileText': FileText,
  'GitBranch': GitBranch,
  'Award': Award,
  'Target': Target,
};

export function TestCard({ template, onClick }: TestCardProps) {
  const IconComponent = ICON_MAP[template.icon] || FileText;
  
  return (
    <Card 
      className="cursor-pointer hover:bg-accent transition-colors p-6"
      onClick={() => onClick(template)}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="mb-1.5">
            {template.title}
          </h3>
          <p className="text-muted-foreground text-sm">
            {template.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
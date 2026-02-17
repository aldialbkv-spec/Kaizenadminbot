import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';

interface CompetitorsConfigProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  competitors: {
    competitor1?: string;
    competitor2?: string;
    competitor3?: string;
  };
  onCompetitorsChange: (competitors: {
    competitor1?: string;
    competitor2?: string;
    competitor3?: string;
  }) => void;
}

export function CompetitorsConfig({
  enabled,
  onEnabledChange,
  competitors,
  onCompetitorsChange,
}: CompetitorsConfigProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Шаг 3: Конкурентный анализ (опционально)</CardTitle>
        <CardDescription>
          Включите конкурентный анализ, чтобы сравнить ваш продукт с конкурентами и получить дополнительные стратегические рекомендации.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="competitors-enabled" checked={enabled} onCheckedChange={onEnabledChange} />
          <Label htmlFor="competitors-enabled" className="cursor-pointer">
            Включить конкурентный анализ
          </Label>
        </div>

        {enabled && (
          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="competitor1">Конкурент 1 (опционально)</Label>
              <Input
                id="competitor1"
                placeholder="Название компании-конкурента"
                value={competitors.competitor1 || ''}
                onChange={(e) =>
                  onCompetitorsChange({ ...competitors, competitor1: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitor2">Конкурент 2 (опционально)</Label>
              <Input
                id="competitor2"
                placeholder="Название компании-конкурента"
                value={competitors.competitor2 || ''}
                onChange={(e) =>
                  onCompetitorsChange({ ...competitors, competitor2: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitor3">Конкурент 3 (опционально)</Label>
              <Input
                id="competitor3"
                placeholder="Название компании-конкурента"
                value={competitors.competitor3 || ''}
                onChange={(e) =>
                  onCompetitorsChange({ ...competitors, competitor3: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

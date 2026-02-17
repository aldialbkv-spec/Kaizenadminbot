import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function PromptInput({ prompt, onPromptChange, onSubmit, isLoading }: PromptInputProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>AI Конструктор Тестов</CardTitle>
        </div>
        <CardDescription>
          Опишите какой тест нужен, и AI автоматически создаст форму и сгенерирует отчет
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm">
            Опишите тест
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Например: Создай тест для анализа проблем. Спроси что произошло, где, когда и кто ответственный. Сгенерируй анализ причин и план действий."
            rows={6}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Примеры промптов:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 pl-4">
            <li>• "Создай тест 5 Почему. Спроси проблему. Задай 5 раз почему. Выдай корневую причину"</li>
            <li>• "Создай анализ рисков проекта. Спроси цель, сроки, бюджет. Сгенерируй список рисков с оценкой"</li>
            <li>• "Создай план ретроспективы. Спроси что было хорошо, что плохо, что улучшить"</li>
          </ul>
        </div>

        <Button
          onClick={onSubmit}
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI анализирует промпт...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Создать тест
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

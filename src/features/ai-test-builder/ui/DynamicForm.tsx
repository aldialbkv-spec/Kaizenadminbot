import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import type { TestSchema, UserInputs } from "../../../entities/ai-test";

interface DynamicFormProps {
  schema: TestSchema;
  userInputs: UserInputs;
  onInputChange: (key: string, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function DynamicForm({
  schema,
  userInputs,
  onInputChange,
  onSubmit,
  onBack,
  isLoading,
}: DynamicFormProps) {
  const allFieldsFilled = schema.inputs.every((key) => userInputs[key]?.trim());

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Заполните данные</CardTitle>
        <CardDescription>
          AI сгенерирует отчет на основе ваших ответов
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {schema.inputs.map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>
                {schema.inputLabels[key] || key}
              </Label>
              <Input
                id={key}
                value={userInputs[key] || ""}
                onChange={(e) => onInputChange(key, e.target.value)}
                placeholder={`Введите ${schema.inputLabels[key]?.toLowerCase() || key}`}
                disabled={isLoading}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !allFieldsFilled}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI генерирует отчет...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Сгенерировать отчет
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

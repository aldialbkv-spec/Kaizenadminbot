import { useState, useEffect } from "react";
import type { TestSchema, UserInputs, TestResult } from "../../../entities/ai-test";
import { extractSchema, generateReport } from "../api/aiTestApi";
import { saveTestToHistory } from "../../../entities/ai-test";

type Step = "prompt" | "form" | "result";

interface UseTestBuilderOptions {
  initialPrompt?: string;
  templateId?: string;
  templateTitle?: string;
}

interface UseTestBuilderReturn {
  // Состояние
  step: Step;
  prompt: string;
  schema: TestSchema | null;
  userInputs: UserInputs;
  result: TestResult | null;
  isLoading: boolean;
  error: string | null;

  // Действия
  setPrompt: (prompt: string) => void;
  handleExtractSchema: () => Promise<void>;
  setUserInput: (key: string, value: string) => void;
  handleGenerateReport: () => Promise<void>;
  reset: () => void;
}

export function useTestBuilder(options: UseTestBuilderOptions = {}): UseTestBuilderReturn {
  const [step, setStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState(options.initialPrompt || "");
  const [schema, setSchema] = useState<TestSchema | null>(null);
  const [userInputs, setUserInputs] = useState<UserInputs>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtractSchema = async () => {
    if (!prompt.trim()) {
      setError("Введите описание теста");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const extractedSchema = await extractSchema(prompt);
      setSchema(extractedSchema);
      setStep("form");
      
      // Инициализируем пустые значения для полей
      const initialInputs: UserInputs = {};
      extractedSchema.inputs.forEach((key) => {
        initialInputs[key] = "";
      });
      setUserInputs(initialInputs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при извлечении схемы");
      console.error("Extract schema error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Автоматически запускаем извлечение схемы, если есть initialPrompt
  useEffect(() => {
    if (options.initialPrompt && step === "prompt") {
      handleExtractSchema();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.initialPrompt]);

  const setUserInput = (key: string, value: string) => {
    setUserInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateReport = async () => {
    if (!schema) return;

    // Проверяем что все поля заполнены
    const emptyFields = schema.inputs.filter((key) => !userInputs[key]?.trim());
    if (emptyFields.length > 0) {
      setError("Заполните все поля");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generatedResult = await generateReport(prompt, userInputs, schema.outputs);
      setResult(generatedResult);
      setStep("result");
      
      // Сохраняем в историю только кастомные тесты
      // A3, VSM, QFD, Hoshin сохраняются автоматически в их backend routes
      const isCustomTest = !options.templateId?.includes('a3') &&
                           !options.templateId?.includes('vsm') &&
                           !options.templateId?.includes('qfd') &&
                           !options.templateId?.includes('hoshin');
      
      if (isCustomTest) {
        try {
          await saveTestToHistory({
            type: 'custom',
            data: {
              templateId: options.templateId,
              templateTitle: options.templateTitle || "Пользовательский тест",
              prompt,
              schema,
              userInputs,
              result: generatedResult,
            },
          });
        } catch (historyError) {
          console.error("Failed to save to history:", historyError);
          // Не показываем ошибку пользователю, просто логируем
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при генерации отчета");
      console.error("Generate report error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep("prompt");
    setPrompt("");
    setSchema(null);
    setUserInputs({});
    setResult(null);
    setError(null);
  };

  return {
    step,
    prompt,
    schema,
    userInputs,
    result,
    isLoading,
    error,
    setPrompt,
    handleExtractSchema,
    setUserInput,
    handleGenerateReport,
    reset,
  };
}
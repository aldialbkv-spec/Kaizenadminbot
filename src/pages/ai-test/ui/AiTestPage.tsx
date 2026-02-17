import { Alert, AlertDescription } from "../../../components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTestBuilder, PromptInput, DynamicForm } from "../../../features/ai-test-builder";
import { TestResultViewer } from "../../../widgets/test-result-viewer";

interface AiTestPageProps {
  initialPrompt?: string;
  templateTitle?: string;
  templateId?: string;
  onBack?: () => void;
}

export function AiTestPage({ initialPrompt, templateTitle, templateId, onBack }: AiTestPageProps) {
  const {
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
  } = useTestBuilder({ initialPrompt, templateTitle, templateId });

  const handleReset = () => {
    if (onBack && initialPrompt) {
      onBack();
    } else {
      reset();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {templateTitle && (
        <div className="space-y-2">
          <h1 className="text-3xl">{templateTitle}</h1>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "prompt" && (
        <PromptInput
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={handleExtractSchema}
          isLoading={isLoading}
        />
      )}

      {step === "form" && schema && (
        <DynamicForm
          schema={schema}
          userInputs={userInputs}
          onInputChange={setUserInput}
          onSubmit={handleGenerateReport}
          onBack={handleReset}
          isLoading={isLoading}
        />
      )}

      {step === "result" && result && schema && (
        <TestResultViewer
          result={result}
          outputSchema={schema.outputs}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
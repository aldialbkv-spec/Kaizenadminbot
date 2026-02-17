import { useState } from 'react';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Sparkles, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { HoshinReportInput } from '../../../entities/hoshin-report';
import { improveHoshinInput, validateHoshinConsistency, type ValidationResult } from '../../../shared/api/hoshinApi';

interface HoshinFormProps {
  onSubmit: (input: HoshinReportInput) => void;
  isGenerating?: boolean;
}

const inputFields = [
  {
    key: 'mission' as const,
    label: 'Миссия компании',
    placeholder: 'Например: Мы существуем, чтобы дать людям силу строить сообщества и сближать мир...',
    description: 'Миссия должна отвечать на вопрос что вы полезного делаете как организация и для кого?',
  },
  {
    key: 'vision' as const,
    label: 'Видение компании',
    placeholder: 'Например: Стать ведущей компанией в области инноваций, создающей ценность для миллионов людей по всему миру к 2030 году...',
    description: 'Какое мы видим будущее нашей организации через 3 года и более, чтобы оно нас вдохновляло?',
  },
  {
    key: 'values' as const,
    label: 'Ценности компании',
    placeholder: 'Например:\\n- Клиентоориентированность: клиент в центре всех наших решений\\n- Инновации: постоянное улучшение и развитие\\n- Командная работа: вместе мы достигаем большего...',
    description: 'Ценности должны определять принципы и убеждения, которые направляют ваш способ работы',
  },
  {
    key: 'goals' as const,
    label: 'Цели на год',
    placeholder: 'Например:\\n- Увеличить долю рынка до 18% к декабрю 2025\\n- Достичь NPS 65+ к концу года\\n- Открыть 12 новых точек присутствия к Q4 2025...',
    description: 'Цели должны быть конкретными, измеримыми, достижимыми, релевантными и ограниченными по времени (SMART)',
  },
];

export function HoshinForm({ onSubmit, isGenerating = false }: HoshinFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<HoshinReportInput>({
    mission: '',
    vision: '',
    values: '',
    goals: '',
  });
  const [isImproving, setIsImproving] = useState(false);
  const [improvedText, setImprovedText] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const currentField = inputFields[currentStep];
  const isLastStep = currentStep === inputFields.length - 1;
  const isFirstStep = currentStep === 0;

  const handleChange = (key: keyof HoshinReportInput, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImprove = async () => {
    const currentText = formData[currentField.key].trim();
    
    if (currentText.length < 5) {
      alert('Текст слишком короткий для улучшения. Добавьте больше деталей.');
      return;
    }

    setIsImproving(true);
    try {
      const improved = await improveHoshinInput(currentText, currentField.key);
      setImprovedText(improved);
      setShowPreview(true);
    } catch (error) {
      console.error('Error improving input:', error);
      alert(error instanceof Error ? error.message : 'Не удалось улучшить текст');
    } finally {
      setIsImproving(false);
    }
  };

  const handleApplyImprovement = () => {
    if (improvedText) {
      handleChange(currentField.key, improvedText);
      setShowPreview(false);
      setImprovedText(null);
    }
  };

  const handleCancelImprovement = () => {
    setShowPreview(false);
    setImprovedText(null);
  };

  const handleNext = () => {
    if (currentStep < inputFields.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await validateHoshinConsistency(
        formData.mission,
        formData.vision,
        formData.values,
        formData.goals
      );
      setValidationResult(result);
      setShowValidation(true);
    } catch (error) {
      console.error('Error validating consistency:', error);
      alert(error instanceof Error ? error.message : 'Не удалось проверить согласованность');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isCurrentFieldValid = formData[currentField.key].trim() !== '';
  const isFormValid = Object.values(formData).every((value) => value.trim() !== '');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h2>Шаг {currentStep + 1} из {inputFields.length}</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor={currentField.key}>
              {currentField.label}
            </Label>
            
            {/* AI Improve Button */}
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={handleImprove}
              disabled={formData[currentField.key].trim().length === 0 || isImproving || isGenerating}
              className="h-auto py-1 px-2 text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {isImproving ? 'Улучшение...' : 'Улучшить с помощью AI'}
            </Button>
          </div>
          
          <Textarea
            id={currentField.key}
            placeholder={currentField.placeholder}
            value={formData[currentField.key]}
            onChange={(e) => handleChange(currentField.key, e.target.value)}
            disabled={isGenerating}
            rows={8}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">{currentField.description}</p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleBack}
          disabled={isFirstStep || isGenerating}
        >
          Назад
        </Button>
        
        <div className="flex gap-2">
          {isLastStep && (
            <Button 
              type="button"
              variant="outline"
              onClick={handleValidate}
              disabled={!isFormValid || isValidating || isGenerating}
            >
              {isValidating ? 'Проверка...' : 'Проверить согласованность'}
            </Button>
          )}
          
          {isLastStep ? (
            <Button 
              type="submit" 
              disabled={!isFormValid || isGenerating}
              size="lg"
            >
              {isGenerating ? 'Генерация отчета...' : 'Сгенерировать Hoshin Kanri'}
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleNext}
              disabled={!isCurrentFieldValid || isGenerating}
            >
              Далее
            </Button>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Улучшенная версия текста</AlertDialogTitle>
            <AlertDialogDescription>
              AI улучшил ваш текст. Сравните исходный и улучшенный варианты:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Исходный текст:</Label>
              <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                {formData[currentField.key]}
              </div>
            </div>
            
            <div>
              <Label className="text-sm">Улучшенный текст:</Label>
              <div className="mt-1 p-3 bg-primary/10 rounded-md text-sm border-2 border-primary/20">
                {improvedText}
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelImprovement}>
              Отменить
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleApplyImprovement}>
              Применить улучшение
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Validation Dialog */}
      <AlertDialog open={showValidation} onOpenChange={setShowValidation}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {validationResult?.isValid ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Проверка пройдена успешно
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  Обнаружены несоответствия
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Результаты проверки согласованности элементов Хосин Канри
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {validationResult && (
            <div className="space-y-4">
              {/* Vision-Mission Check */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {validationResult.visionMissionCheck.isConsistent ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className="font-medium">Видение и Миссия</h3>
                </div>
                {validationResult.visionMissionCheck.issue && (
                  <div className="ml-7 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
                    {validationResult.visionMissionCheck.issue}
                  </div>
                )}
              </div>

              {/* Goals-Vision Check */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {validationResult.goalsVisionCheck.isConsistent ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className="font-medium">Цели и Видение</h3>
                </div>
                {validationResult.goalsVisionCheck.issue && (
                  <div className="ml-7 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
                    {validationResult.goalsVisionCheck.issue}
                  </div>
                )}
              </div>

              {/* Overall Check */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {validationResult.overallCheck.isConsistent ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className="font-medium">Общая согласованность</h3>
                </div>
                {validationResult.overallCheck.issue && (
                  <div className="ml-7 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
                    {validationResult.overallCheck.issue}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {validationResult.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Рекомендации:</h3>
                  <ul className="ml-7 space-y-2">
                    {validationResult.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm list-disc">
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResult.isValid && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ Все элементы согласованы между собой. Можете продолжить генерацию отчета.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowValidation(false)}>
              Закрыть
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}

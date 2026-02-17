import { useState } from 'react';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';
import { Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { A3ReportInput } from '../../../entities/a3-report';

interface A3InputFormProps {
  onSubmit: (input: A3ReportInput) => void;
  isLoading?: boolean;
}

const inputFields = [
  {
    key: 'what' as const,
    label: 'Что (What)',
    placeholder: 'Опишите проблему. Что конкретно произошло?',
    description: 'Краткое описание проблемы',
  },
  {
    key: 'where' as const,
    label: 'Где (Where)',
    placeholder: 'Укажите место/процесс. В каком конкретном месте произошло?',
    description: 'Место, подразделение',
  },
  {
    key: 'when' as const,
    label: 'Когда (When)',
    placeholder: 'На каком этапе процесса это происходит?',
    description: 'Конкретный этап процесса',
  },
  {
    key: 'who' as const,
    label: 'Кто (Who)',
    placeholder: 'Участники, вовлечённые отделы. Кто выявил проблему?',
    description: 'Люди и подразделения, связанные с проблемой',
  },
  {
    key: 'why' as const,
    label: 'Почему (Why)',
    placeholder: 'Почему критично, какое влияние? Почему это происходит?',
    description: 'Критичность, влияние на бизнес',
  },
  {
    key: 'how' as const,
    label: 'Как (How)',
    placeholder: 'Как проявляется, цифры, факты, KPI. Как часто и как много?',
    description: 'Последствия в конкретных цифрах',
  },
];

export function A3InputForm({ onSubmit, isLoading = false }: A3InputFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<A3ReportInput>({
    what: '',
    where: '',
    when: '',
    who: '',
    why: '',
    how: '',
  });
  const [isImproving, setIsImproving] = useState(false);
  const [improvedText, setImprovedText] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const currentField = inputFields[currentStep];
  const isLastStep = currentStep === inputFields.length - 1;
  const isFirstStep = currentStep === 0;

  const handleChange = (key: keyof A3ReportInput, value: string) => {
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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4c493c62/a3-reports/improve-input`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            text: currentText,
            fieldType: currentField.key,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка улучшения текста');
      }

      const data = await response.json();
      setImprovedText(data.improvedText);
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

  const validateCurrentField = async (): Promise<boolean> => {
    const currentText = formData[currentField.key].trim();
    
    if (currentText.length < 3) {
      setValidationMessage('Ответ слишком короткий. Добавьте больше деталей.');
      setShowValidationError(true);
      return false;
    }

    setIsValidating(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4c493c62/a3-reports/validate-input`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            text: currentText,
            fieldType: currentField.key,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка валидации');
      }

      const data = await response.json();
      
      if (!data.isValid) {
        setValidationMessage(data.message);
        setShowValidationError(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating input:', error);
      // В случае ошибки API пропускаем валидацию и позволяем продолжить
      return true;
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentField();
    if (isValid && currentStep < inputFields.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
              disabled={formData[currentField.key].trim().length === 0 || isImproving || isLoading}
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
            disabled={isLoading}
            rows={6}
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
          disabled={isFirstStep || isLoading}
        >
          Назад
        </Button>
        
        {isLastStep ? (
          <Button 
            type="submit" 
            disabled={!isFormValid || isLoading}
            size="lg"
          >
            {isLoading ? 'Генерация отчета...' : 'Сгенерировать A3 отчет'}
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={handleNext}
            disabled={!isCurrentFieldValid || isLoading || isValidating}
          >
            {isValidating ? 'Проверка...' : 'Далее'}
          </Button>
        )}
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

      {/* Validation Error Dialog */}
      <AlertDialog open={showValidationError} onOpenChange={setShowValidationError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ответ не соответствует полю "{currentField.label}"</AlertDialogTitle>
            <AlertDialogDescription>
              {validationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="mb-2">Ваш текст:</p>
            <p>{formData[currentField.key]}</p>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowValidationError(false);
              handleImprove();
            }}>
              <Sparkles className="w-4 h-4 mr-2" />
              Улучшить с помощью AI
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
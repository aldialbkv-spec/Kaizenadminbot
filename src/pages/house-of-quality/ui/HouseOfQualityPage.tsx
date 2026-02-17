import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from 'sonner@2.0.3';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { QfdInputForm } from '../../../features/fill-qfd-inputs';
import { RequirementsEditor, CharacteristicsEditor } from '../../../features/edit-qfd-lists';
import { CompetitorsConfig } from '../../../features/configure-competitors';
import { QfdReportDisplay } from '../../../widgets/qfd-report-display';
import { generateQFDLists, generateQFDReport } from '../../../entities/qfd-report';
import type {
  CustomerRequirement,
  TechnicalCharacteristic,
  QFDReport,
} from '../../../entities/qfd-report';

type Step = 1 | 2 | 3 | 4;

interface HouseOfQualityPageProps {
  onBack?: () => void;
  onSuccess?: (id: string) => void;
}

export function HouseOfQualityPage({ onBack: onBackProp, onSuccess }: HouseOfQualityPageProps = {}) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Исходные данные
  const [companyDescription, setCompanyDescription] = useState('');

  // Step 2: Списки (редактируемые)
  const [customerRequirements, setCustomerRequirements] = useState<CustomerRequirement[]>([]);
  const [technicalCharacteristics, setTechnicalCharacteristics] = useState<TechnicalCharacteristic[]>([]);

  // Step 3: Конкуренты
  const [competitorsEnabled, setCompetitorsEnabled] = useState(false);
  const [competitors, setCompetitors] = useState<{
    competitor1?: string;
    competitor2?: string;
    competitor3?: string;
  }>({});

  // Step 4: Финальный отчет
  const [qfdReport, setQfdReport] = useState<QFDReport | null>(null);

  // Step 1 → Step 2: Генерация списков
  const handleGenerateLists = async (data: { companyDescription: string }) => {
    setIsLoading(true);
    try {
      const lists = await generateQFDLists(data);
      setCompanyDescription(data.companyDescription);
      setCustomerRequirements(lists.customerRequirements);
      setTechnicalCharacteristics(lists.technicalCharacteristics);
      setCurrentStep(2);
      toast.success('Списки успешно сгенерированы!');
    } catch (error) {
      console.error('Error generating QFD lists:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось сгенерировать списки');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 → Step 3
  const handleProceedToConfig = () => {
    if (customerRequirements.length === 0 || technicalCharacteristics.length === 0) {
      toast.error('Списки не могут быть пустыми');
      return;
    }
    setCurrentStep(3);
  };

  // Step 3 → Step 4: Генерация финального отчета
  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const report = await generateQFDReport({
        companyDescription,
        customerRequirements,
        technicalCharacteristics,
        competitorsEnabled,
        competitors: competitorsEnabled ? competitors : undefined,
      });
      setQfdReport(report);
      toast.success('QFD отчет успешно сгенерирован!');
      
      // Если есть callback onSuccess, перенаправляем на просмотр
      if (onSuccess && report.id) {
        onSuccess(report.id);
      } else {
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error generating QFD report:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось сгенерировать отчет');
    } finally {
      setIsLoading(false);
    }
  };

  // Навигация назад
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  // Сброс к началу
  const handleReset = () => {
    setCurrentStep(1);
    setCompanyDescription('');
    setProduct('');
    setCustomerRequirements([]);
    setTechnicalCharacteristics([]);
    setCompetitorsEnabled(false);
    setCompetitors({});
    setQfdReport(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Степпер */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Дом качества (QFD)</CardTitle>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                    currentStep === step
                      ? 'bg-primary text-primary-foreground'
                      : currentStep > step
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-sm text-muted-foreground mt-2">
            <div className={currentStep === 1 ? 'text-foreground' : ''}>Исходные данные</div>
            <div className={currentStep === 2 ? 'text-foreground' : ''}>Редактирование списков</div>
            <div className={currentStep === 3 ? 'text-foreground' : ''}>Конфигурация</div>
            <div className={currentStep === 4 ? 'text-foreground' : ''}>Отчет</div>
          </div>
        </CardHeader>
      </Card>

      {/* Step 1: Форма ввода */}
      {currentStep === 1 && <QfdInputForm onSubmit={handleGenerateLists} isLoading={isLoading} />}

      {/* Step 2: Редактирование списков */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Шаг 2: Редактирование списков</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Проверьте сгенерированные списки. Вы можете добавлять или удалять пункты перед генерацией отчета.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <RequirementsEditor
              requirements={customerRequirements}
              onChange={setCustomerRequirements}
            />

            <CharacteristicsEditor
              characteristics={technicalCharacteristics}
              onChange={setTechnicalCharacteristics}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <Button onClick={handleProceedToConfig} className="flex-1">
              Далее
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Конфигурация конкурентов */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <CompetitorsConfig
            enabled={competitorsEnabled}
            onEnabledChange={setCompetitorsEnabled}
            competitors={competitors}
            onCompetitorsChange={setCompetitors}
          />

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <Button onClick={handleGenerateReport} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Генерируем отчет...
                </>
              ) : (
                'Сгенерировать QFD отчет'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Финальный отчет */}
      {currentStep === 4 && qfdReport && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <Button variant="outline" onClick={handleReset} className="ml-auto">
              Создать новый отчет
            </Button>
          </div>

          <QfdReportDisplay report={qfdReport} />
        </div>
      )}
    </div>
  );
}
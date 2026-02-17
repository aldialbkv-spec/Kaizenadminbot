import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { generateVsm, improveVsmText } from '../../../entities/vsm';
import { toast } from 'sonner@2.0.3';

interface CreateVsmPageProps {
  onBack?: () => void;
  onSuccess?: (id: string) => void;
}

export function CreateVsmPage({ onBack, onSuccess }: CreateVsmPageProps) {
  const [loading, setLoading] = useState(false);
  const [improvingActivity, setImprovingActivity] = useState(false);
  const [improvingProcess, setImprovingProcess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyActivity: '',
    processToImprove: '',
  });

  const handleImproveActivity = async () => {
    if (!formData.companyActivity.trim()) {
      toast.error('Введите описание деятельности для улучшения');
      return;
    }

    setImprovingActivity(true);
    try {
      const result = await improveVsmText(formData.companyActivity.trim(), 'activity');
      setFormData({ ...formData, companyActivity: result.improvedText });
      toast.success('Описание деятельности улучшено!');
    } catch (error) {
      console.error('Error improving activity:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось улучшить описание');
    } finally {
      setImprovingActivity(false);
    }
  };

  const handleImproveProcess = async () => {
    if (!formData.processToImprove.trim()) {
      toast.error('Введите описание процесса для улучшения');
      return;
    }

    setImprovingProcess(true);
    try {
      const result = await improveVsmText(formData.processToImprove.trim(), 'process');
      setFormData({ ...formData, processToImprove: result.improvedText });
      toast.success('Описание процесса улучшено!');
    } catch (error) {
      console.error('Error improving process:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось улучшить описание');
    } finally {
      setImprovingProcess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim() || !formData.companyActivity.trim() || !formData.processToImprove.trim()) {
      return;
    }

    try {
      setLoading(true);
      const map = await generateVsm(formData);
      onSuccess?.(map.id);
    } catch (error) {
      console.error('Ошибка генерации карты потока:', error);
      alert('Не удалось сгенерировать карту потока. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="mb-2">Создать карту потока создания ценности</h1>
        <p className="text-muted-foreground">
          Ответьте на три вопроса для построения карты потока создания ценности
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">
            1. Название компании
          </Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="Например: ООО 'Мебельная мастерская'"
            disabled={loading || improvingActivity || improvingProcess}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyActivity">
            2. Чем занимается компания (основной вид деятельности)?
          </Label>
          <Textarea
            id="companyActivity"
            value={formData.companyActivity}
            onChange={(e) => setFormData({ ...formData, companyActivity: e.target.value })}
            placeholder="Например: Производство мебели на заказ из массива дерева"
            rows={4}
            disabled={loading || improvingActivity}
            required
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImproveActivity}
            disabled={!formData.companyActivity.trim() || improvingActivity || improvingProcess || loading}
            className="mt-2"
          >
            {improvingActivity ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Улучшение...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Улучшить через ИИ
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="processToImprove">
            3. Какой процесс улучшить?
          </Label>
          <Textarea
            id="processToImprove"
            value={formData.processToImprove}
            onChange={(e) => setFormData({ ...formData, processToImprove: e.target.value })}
            placeholder="Например: Процесс от получения заказа до доставки готовой мебели клиенту"
            rows={4}
            disabled={loading || improvingProcess}
            required
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImproveProcess}
            disabled={!formData.processToImprove.trim() || improvingProcess || improvingActivity || loading}
            className="mt-2"
          >
            {improvingProcess ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Улучшение...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                Улучшить через ИИ
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading || improvingActivity || improvingProcess}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={loading || improvingActivity || improvingProcess}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {loading ? 'Генерация...' : 'Сгенерировать карту'}
          </Button>
        </div>
      </form>
    </div>
  );
}
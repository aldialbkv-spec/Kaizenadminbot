import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Loader2, Search, Sparkles, Building2, FileEdit } from 'lucide-react';
import { searchCompanyInfo, improveDescription } from '../../../entities/qfd-report/api/qfdApi';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from '../../../components/ui/alert';

interface QfdInputFormProps {
  onSubmit: (data: { companyDescription: string }) => void;
  isLoading?: boolean;
}

type InputMode = 'search' | 'manual';

export function QfdInputForm({ onSubmit, isLoading = false }: QfdInputFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>('search');
  
  // Режим поиска компании
  const [companyName, setCompanyName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    companyName: string;
    description: string;
    confidence: 'high' | 'medium' | 'low';
    suggestion?: string;
  } | null>(null);
  
  // Режим ручного ввода
  const [manualDescription, setManualDescription] = useState('');
  const [isImproving, setIsImproving] = useState(false);

  const handleSearchCompany = async () => {
    if (!companyName.trim()) {
      toast.error('Введите название компании');
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchCompanyInfo(companyName.trim());
      setSearchResult(result);
      
      if (result.found && result.confidence === 'high') {
        toast.success('Информация о компании найдена!');
      } else if (result.found && result.confidence === 'medium') {
        toast.warning('Информация найдена, но может быть неполной');
      } else {
        toast.info('Рекомендуем ввести описание вручную');
      }
    } catch (error) {
      console.error('Error searching company:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось найти информацию о компании');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImproveDescription = async () => {
    if (!manualDescription.trim()) {
      toast.error('Введите описание для улучшения');
      return;
    }

    setIsImproving(true);
    try {
      const result = await improveDescription(manualDescription.trim());
      setManualDescription(result.improvedDescription);
      toast.success('Описание улучшено!');
    } catch (error) {
      console.error('Error improving description:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось улучшить описание');
    } finally {
      setIsImproving(false);
    }
  };

  const handleUseSearchResult = () => {
    if (searchResult?.description) {
      onSubmit({ companyDescription: searchResult.description });
    }
  };

  const handleEditSearchResult = () => {
    if (searchResult?.description) {
      setManualDescription(searchResult.description);
      setInputMode('manual');
      setSearchResult(null);
    }
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualDescription.trim()) {
      onSubmit({ companyDescription: manualDescription.trim() });
    }
  };

  const isManualValid = manualDescription.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Шаг 1: Описание компании и продукта</CardTitle>
        <CardDescription>
          Укажите информацию о компании и продукте для QFD анализа. ИИ сгенерирует списки требований и характеристик.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Переключатель режима */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setInputMode('search')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              inputMode === 'search'
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            }`}
            disabled={isLoading}
          >
            <Building2 className="h-4 w-4" />
            Поиск компании
          </button>
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              inputMode === 'manual'
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            }`}
            disabled={isLoading}
          >
            <FileEdit className="h-4 w-4" />
            Ручной ввод
          </button>
        </div>

        {/* Режим поиска */}
        {inputMode === 'search' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Название компании *</Label>
              <div className="flex gap-2">
                <Input
                  id="companyName"
                  placeholder="Например: Tesla, Яндекс, Сбербанк"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isSearching || isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchCompany();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleSearchCompany}
                  disabled={!companyName.trim() || isSearching || isLoading}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Результат поиска */}
            {searchResult && (
              <div className="space-y-3">
                <Alert className={
                  searchResult.confidence === 'high' ? 'border-green-500' :
                  searchResult.confidence === 'medium' ? 'border-yellow-500' :
                  'border-red-500'
                }>
                  <AlertDescription className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="mb-1">
                          <strong>{searchResult.companyName}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {searchResult.description}
                        </p>
                      </div>
                    </div>
                    
                    {searchResult.suggestion && (
                      <p className="text-sm italic text-muted-foreground mt-2">
                        💡 {searchResult.suggestion}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleUseSearchResult}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Генерируем списки...
                      </>
                    ) : (
                      'Использовать это описание'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEditSearchResult}
                    disabled={isLoading}
                  >
                    Редактировать
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Режим ручного ввода */}
        {inputMode === 'manual' && (
          <form onSubmit={handleSubmitManual} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Описание компании и продукта *</Label>
              <Textarea
                id="description"
                placeholder="Опишите компанию, её деятельность, продукт/услугу для анализа, целевую аудиторию, ключевые особенности..."
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                disabled={isLoading || isImproving}
                rows={6}
                required
              />
              <p className="text-sm text-muted-foreground">
                Укажите основную деятельность, продукт/услугу, целевую аудиторию и ключевые особенности
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleImproveDescription}
                disabled={!isManualValid || isImproving || isLoading}
                className="flex-1"
              >
                {isImproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Улучшаем...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Улучшить с помощью AI
                  </>
                )}
              </Button>
              
              <Button
                type="submit"
                disabled={!isManualValid || isLoading || isImproving}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Генерируем списки...
                  </>
                ) : (
                  'Сгенерировать списки'
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

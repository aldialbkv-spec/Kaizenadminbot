import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Loader2, Share2, Copy, Check } from 'lucide-react';
import { getA3ReportById } from '../../../entities/a3-report';
import type { A3Report } from '../../../entities/a3-report';
import { shareContent, canUseNativeShare } from '../../../shared/lib/share';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { A3ReportDisplay } from '../../../widgets/a3-report-display';

interface ViewReportPageProps {
  reportId: string;
  onBack: () => void;
  shareTriggered?: number;
}

export function ViewReportPage({ reportId, onBack, shareTriggered }: ViewReportPageProps) {
  const [report, setReport] = useState<A3Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prevShareTrigger, setPrevShareTrigger] = useState(0);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  // Отслеживаем изменения shareTriggered (не первый рендер)
  useEffect(() => {
    if (shareTriggered && shareTriggered > 0 && shareTriggered !== prevShareTrigger) {
      setPrevShareTrigger(shareTriggered);
      handleShare();
    }
  }, [shareTriggered]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await getA3ReportById(reportId);
      setReport(data);
    } catch (error) {
      console.error('Ошибка загрузки отчета:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/${reportId}`;
    
    // Если есть нативный share API (мобильные), используем его
    if (canUseNativeShare()) {
      await shareContent({
        title: report?.title || 'Отчет A3',
        text: 'Посмотрите этот отчет A3',
        url: shareUrl,
      });
    } else {
      // На десктопе открываем модалку
      setShareDialogOpen(true);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/share/${reportId}`;
    
    try {
      // Пробуем современный API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch (err) {
      console.warn('Clipboard API failed, using fallback');
    }
    
    // Fallback: выделяем текст в input для ручного копирования
    const input = document.getElementById('share-url-input') as HTMLInputElement;
    if (input) {
      input.select();
      input.setSelectionRange(0, 99999); // Для мобильных
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!report || !report.output) {
    return (
      <div className="container mx-auto p-8">
        <div className="space-y-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 size-4" />
            Назад к списку
          </Button>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">Отчет не найден или не сгенерирован</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        {/* Заголовок отчета */}
        <div>
          <h1 className="mb-2">{report.title || `Отчет #${report.id.slice(0, 8)}`}</h1>
          <p className="text-muted-foreground">
            Создан: {new Date(report.createdAt).toLocaleDateString('ru-RU')}
          </p>
        </div>

        {/* Модалка для шаринга */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Поделиться отчетом</DialogTitle>
              <DialogDescription>
                Скопируйте ссылку для отправки другим пользователям
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  id="share-url-input"
                  value={`${window.location.origin}/share/${reportId}`}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopyLink} variant="secondary">
                  {copied ? (
                    <>
                      <Check className="mr-2 size-4" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 size-4" />
                      Копировать
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Полный A3 отчет с исходными данными и результатами */}
        <A3ReportDisplay input={report.input} output={report.output} />
      </div>
    </div>
  );
}
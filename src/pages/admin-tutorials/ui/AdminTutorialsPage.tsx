import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Upload, Trash2, Plus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { uploadVideo, getTutorials, deleteTutorial } from '../../../entities/tutorial/api/adminApi';
import type { Tutorial } from '../../../entities/tutorial';
import { useAuth } from '../../../app/providers/AuthProvider';

export function AdminTutorialsPage() {
  const { user } = useAuth();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Форма для загрузки
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    file: null as File | null,
  });

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    try {
      setIsLoading(true);
      const data = await getTutorials();
      setTutorials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки туториалов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('video/')) {
        setError('Пожалуйста, выберите видео файл');
        return;
      }

      // Получить длительность видео
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        setFormData(prev => ({
          ...prev,
          file,
          duration: Math.round(video.duration),
        }));
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.file || !formData.title) {
      setError('Заполните все поля и выберите файл');
      return;
    }

    try {
      setIsUploading(true);
      await uploadVideo({
        file: formData.file,
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
      });

      setSuccess('Видео успешно загружено! 🎉');
      
      // Очистить форму
      setFormData({
        title: '',
        description: '',
        duration: 0,
        file: null,
      });

      // Обновить список
      await loadTutorials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки видео');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот туториал?')) return;

    try {
      await deleteTutorial(id);
      setSuccess('Туториал удален');
      await loadTutorials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    }
  };

  // Проверка что пользователь - админ
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Доступ запрещен. Только для администраторов.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1>Управление видео-уроками</h1>
        <p className="text-muted-foreground">
          Загрузка и управление обучающими видео
        </p>
      </div>

      {/* Форма загрузки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            Загрузить новое видео
          </CardTitle>
          <CardDescription>
            Видео будет доступно всем пользователям Telegram бота
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            {/* Название */}
            <div className="space-y-2">
              <Label htmlFor="title">Название видео *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введение в Kaizen Center"
                required
              />
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Краткое описание видео..."
                rows={3}
              />
            </div>

            {/* Файл */}
            <div className="space-y-2">
              <Label htmlFor="video">Видео файл *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="flex-1"
                  required
                />
                {formData.duration > 0 && (
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {Math.floor(formData.duration / 60)}:{String(formData.duration % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Поддерживаются форматы: MP4, WebM, MOV. Рекомендуемый размер: до 100MB
              </p>
            </div>

            {/* Ошибки и успех */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Кнопка */}
            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Загрузить видео
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Список туториалов */}
      <Card>
        <CardHeader>
          <CardTitle>Загруженные видео ({tutorials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : tutorials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет загруженных видео
            </div>
          ) : (
            <div className="space-y-3">
              {tutorials.map((tutorial, index) => (
                <div
                  key={tutorial.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      <h3 className="font-semibold">{tutorial.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {tutorial.description || 'Нет описания'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {Math.floor(tutorial.duration / 60)}:{String(tutorial.duration % 60).padStart(2, '0')}
                      </span>
                      <span>{tutorial.storage_path}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tutorial.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

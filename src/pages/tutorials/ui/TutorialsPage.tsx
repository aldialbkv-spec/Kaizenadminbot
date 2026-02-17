import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle, Loader2, PlayCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { VideoPlayer } from '../../../features/video-player';
import { TutorialNavigation } from '../../../widgets/tutorial-navigation';
import { getTutorials, getVideoUrl, updateVideoProgress, markAsWatched } from '../../../entities/tutorial';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { TutorialWithProgress } from '../../../entities/tutorial';

export function TutorialsPage() {
  const { user } = useAuth();
  const [tutorials, setTutorials] = useState<TutorialWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState(0);

  // Загрузка списка туториалов
  useEffect(() => {
    if (user) {
      loadTutorials();
    }
  }, [user]);

  // Загрузка видео при смене туториала
  useEffect(() => {
    if (tutorials.length > 0) {
      loadVideo(tutorials[currentIndex].id);
    }
  }, [currentIndex, tutorials.length]);

  const loadTutorials = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getTutorials(user.id);
      setTutorials(data);

      // Найти первое непросмотренное видео
      const firstUnwatched = data.findIndex(t => !t.watched);
      if (firstUnwatched !== -1) {
        setCurrentIndex(firstUnwatched);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить туториалы');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVideo = async (tutorialId: string) => {
    try {
      setIsLoadingVideo(true);
      setError(null);
      const url = await getVideoUrl(tutorialId);
      setVideoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить видео');
      setVideoUrl(null);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleTimeUpdate = useCallback(async (currentTime: number) => {
    if (!user || !tutorials[currentIndex]) return;

    // Сохраняем прогресс каждые 5 секунд
    if (Math.abs(currentTime - lastSavedTime) >= 5) {
      setLastSavedTime(currentTime);
      try {
        await updateVideoProgress(user.id, tutorials[currentIndex].id, currentTime, false);
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }
  }, [user, tutorials, currentIndex, lastSavedTime]);

  const handleVideoEnded = async () => {
    if (!user || !tutorials[currentIndex]) return;

    try {
      // Отмечаем как просмотренное
      await markAsWatched(user.id, tutorials[currentIndex].id);

      // Обновляем локальное состояние
      const updatedTutorials = [...tutorials];
      updatedTutorials[currentIndex] = {
        ...updatedTutorials[currentIndex],
        watched: true,
      };
      setTutorials(updatedTutorials);

      // Автоматически переходим к следующему видео
      if (currentIndex < tutorials.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to mark as watched:', err);
    }
  };

  const handleNavigate = (index: number) => {
    if (index >= 0 && index < tutorials.length) {
      setCurrentIndex(index);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <Loader2 className="size-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Загрузка туториалов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (tutorials.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="text-center space-y-4 py-12">
          <PlayCircle className="size-16 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Туториалы не найдены</h2>
            <p className="text-muted-foreground">
              Видео-уроки скоро появятся
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentTutorial = tutorials[currentIndex];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1>Обучающие видео</h1>
        <p className="text-muted-foreground">
          Пошаговые инструкции по работе с Kaizen Center
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          {isLoadingVideo ? (
            <div className="flex items-center justify-center aspect-video bg-muted rounded-lg">
              <Loader2 className="size-12 animate-spin text-primary" />
            </div>
          ) : videoUrl ? (
            <VideoPlayer
              videoUrl={videoUrl}
              title={currentTutorial.title}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              initialTime={currentTutorial.lastPosition}
            />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Не удалось загрузить видео
              </AlertDescription>
            </Alert>
          )}

          {/* Current Tutorial Info */}
          <div className="mt-4 space-y-2">
            <h2 className="text-xl font-semibold">{currentTutorial.title}</h2>
            <p className="text-muted-foreground">{currentTutorial.description}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="lg:col-span-1">
          <TutorialNavigation
            tutorials={tutorials}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </div>
  );
}

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { Tutorial, UserVideoProgress, TutorialWithProgress } from '../model/types';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1c191bcf`;

/**
 * Получить список всех туториалов с прогрессом пользователя
 */
export async function getTutorials(userId: string | number): Promise<TutorialWithProgress[]> {
  const response = await fetch(`${SERVER_URL}/tutorials?userId=${userId}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[tutorialApi] Failed to fetch tutorials:', error);
    throw new Error('Не удалось загрузить туториалы');
  }

  return response.json();
}

/**
 * Получить signed URL для просмотра видео
 */
export async function getVideoUrl(tutorialId: string): Promise<string> {
  const response = await fetch(`${SERVER_URL}/tutorials/${tutorialId}/video-url`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[tutorialApi] Failed to get video URL:', error);
    throw new Error('Не удалось получить ссылку на видео');
  }

  const data = await response.json();
  return data.url;
}

/**
 * Обновить прогресс просмотра видео
 */
export async function updateVideoProgress(
  userId: string | number,
  tutorialId: string,
  position: number,
  watched: boolean = false
): Promise<void> {
  const response = await fetch(`${SERVER_URL}/tutorials/progress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      tutorialId,
      position,
      watched,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[tutorialApi] Failed to update progress:', error);
    throw new Error('Не удалось сохранить прогресс');
  }
}

/**
 * Отметить видео как просмотренное
 */
export async function markAsWatched(
  userId: string | number,
  tutorialId: string
): Promise<void> {
  await updateVideoProgress(userId, tutorialId, 0, true);
}
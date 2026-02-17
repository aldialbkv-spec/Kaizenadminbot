import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { Tutorial } from '../model/types';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/smart-function`;

interface UploadVideoData {
  file: File;
  title: string;
  description: string;
  duration: number;
}

/**
 * Загрузить видео в Supabase Storage + создать запись в БД
 */
export async function uploadVideo(data: UploadVideoData): Promise<Tutorial> {
  const formData = new FormData();
  formData.append('video', data.file);
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('duration', String(data.duration));

  const response = await fetch(`${SERVER_URL}/tutorials/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[adminApi] Upload failed:', error);
    throw new Error('Не удалось загрузить видео');
  }

  return response.json();
}

/**
 * Получить все туториалы (для админа)
 */
export async function getTutorials(): Promise<Tutorial[]> {
  const response = await fetch(`${SERVER_URL}/tutorials/admin/list`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[adminApi] Failed to fetch tutorials:', error);
    throw new Error('Не удалось загрузить список');
  }

  return response.json();
}

/**
 * Удалить туториал (файл из Storage + запись из БД)
 */
export async function deleteTutorial(id: string): Promise<void> {
  const response = await fetch(`${SERVER_URL}/tutorials/admin/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[adminApi] Delete failed:', error);
    throw new Error('Не удалось удалить туториал');
  }
}
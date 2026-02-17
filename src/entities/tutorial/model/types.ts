/**
 * Типы для сущности видео-туториалов
 */

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: number; // в секундах
  thumbnail_url?: string;
  storage_path: string; // путь к видео в Supabase Storage
  order_index: number; // порядок показа
  created_at: string;
}

export interface UserVideoProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  watched: boolean;
  last_position: number; // последняя позиция в секундах
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TutorialWithProgress extends Tutorial {
  progress?: UserVideoProgress;
  watched: boolean;
  lastPosition: number;
}

-- Миграция для системы видео-туториалов
-- Выполнить через Supabase UI → SQL Editor

-- 1. Создать Storage Bucket для видео
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutorials', 'tutorials', false);

-- 2. Настроить политики доступа к Storage
-- Разрешить чтение всем аутентифицированным пользователям
CREATE POLICY "Allow authenticated users to read tutorials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tutorials');

-- Разрешить загрузку только service role (для админов через backend)
CREATE POLICY "Allow service role to upload tutorials"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'tutorials');

-- 3. Создать таблицу tutorials (метаданные видео)
CREATE TABLE tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- длительность в секундах
  thumbnail_url TEXT,
  storage_path TEXT NOT NULL, -- путь к файлу в Storage
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс для сортировки по порядку
CREATE INDEX idx_tutorials_order ON tutorials(order_index);

-- 4. Создать таблицу user_video_progress (прогресс просмотра)
CREATE TABLE user_video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Telegram ID или Supabase UUID
  tutorial_id UUID NOT NULL REFERENCES tutorials(id) ON DELETE CASCADE,
  watched BOOLEAN DEFAULT FALSE,
  last_position INTEGER DEFAULT 0, -- последняя позиция в секундах
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Уникальная пара user + tutorial
  UNIQUE(user_id, tutorial_id)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_user_video_progress_user ON user_video_progress(user_id);
CREATE INDEX idx_user_video_progress_tutorial ON user_video_progress(tutorial_id);

-- 5. Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для tutorials
CREATE TRIGGER update_tutorials_updated_at
BEFORE UPDATE ON tutorials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Триггер для user_video_progress
CREATE TRIGGER update_user_video_progress_updated_at
BEFORE UPDATE ON user_video_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. ПРИМЕР: Добавить тестовый туториал
-- (после загрузки видео в Storage bucket "tutorials")
/*
INSERT INTO tutorials (title, description, duration, storage_path, order_index)
VALUES 
  ('Введение в Kaizen Center', 'Обзор возможностей платформы', 300, 'intro.mp4', 1),
  ('Создание A3 отчета', 'Пошаговая инструкция по созданию отчета A3', 600, 'a3-report.mp4', 2),
  ('Работа с VSM', 'Как создать карту потока создания ценности', 480, 'vsm-guide.mp4', 3);
*/

-- Готово! Теперь можно:
-- 1. Загрузить видео в Storage через UI: Storage → tutorials → Upload
-- 2. Добавить записи в таблицу tutorials с путями к видео
-- 3. Фронтенд будет автоматически показывать видео и отслеживать прогресс

-- Миграция: Добавление поля user_id в test_history
-- Для разделения данных между пользователями и поддержки админа

-- 1. Добавить колонку user_id
ALTER TABLE test_history 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 2. Создать индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_test_history_user_id ON test_history(user_id);

-- 3. Комментарий для будущих разработчиков
COMMENT ON COLUMN test_history.user_id IS 'Telegram ID (number as text) or Supabase UUID for web users';

-- Примечание: Существующие записи будут иметь NULL в user_id
-- Их можно либо удалить, либо назначить тестовому пользователю

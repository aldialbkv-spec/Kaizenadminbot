-- Миграция: Настройка Supabase Auth для админов
-- Включение аутентификации через email/password

-- 1. Проверка что Auth включен (выполняется автоматически в Supabase)
-- Auth уже настроен через Supabase Dashboard

-- 2. Создать первого админа (выполнить через Supabase Dashboard)
-- Dashboard → Authentication → Users → Add User
-- Email: admin@kaizen.local
-- Password: (установить свой пароль)

-- 3. Настройка RLS (Row Level Security) для test_history - опционально
-- Если нужно запретить прямой доступ к таблице через Supabase API:

-- Включить RLS
ALTER TABLE test_history ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователи видят только свои записи
CREATE POLICY "Users can view own test history"
ON test_history FOR SELECT
USING (
  user_id = CAST(auth.uid() AS TEXT) -- для веб-пользователей
  OR user_id IS NULL -- старые записи без user_id
);

-- Политика: Пользователи могут создавать записи
CREATE POLICY "Users can insert own test history"
ON test_history FOR INSERT
WITH CHECK (
  user_id = CAST(auth.uid() AS TEXT)
);

-- Политика: Service role может делать всё (для backend)
CREATE POLICY "Service role has full access"
ON test_history
USING (auth.jwt() ->> 'role' = 'service_role');

-- Примечание: Backend использует service_role ключ, поэтому RLS его не затрагивает
-- Фильтрация по user_id происходит на уровне Edge Functions

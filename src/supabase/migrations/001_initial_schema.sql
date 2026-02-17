-- Начальная миграция для Kaizen Center
-- Создание базовых таблиц для хранения данных

-- 1. Таблица для истории тестов
CREATE TABLE IF NOT EXISTS test_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- тип теста: 'a3', 'vsm', 'qfd', 'hoshin', 'custom'
  data JSONB NOT NULL, -- данные теста/отчета
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс для быстрой сортировки по дате
CREATE INDEX IF NOT EXISTS idx_test_history_created_at ON test_history(created_at DESC);

-- Индекс для поиска по типу теста
CREATE INDEX IF NOT EXISTS idx_test_history_type ON test_history(type);

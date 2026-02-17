# 🔧 Настройка Supabase для Kaizen Center

Пошаговая инструкция по подключению нового проекта Supabase.

## 📋 Шаг 1: Создание проекта Supabase

1. **Перейти на** https://supabase.com
2. **Войти/зарегистрироваться** через GitHub или email
3. **Нажать** "New Project"
4. **Заполнить данные:**
   - **Name:** `kaizen-center` (или любое имя)
   - **Database Password:** сгенерировать надежный пароль (сохраните!)
   - **Region:** выбрать ближайший регион (например, Frankfurt для Европы)
   - **Pricing Plan:** Free (для старта)
5. **Нажать** "Create new project"
6. **Подождать** 2-3 минуты пока проект создается

---

## 🔑 Шаг 2: Получение API ключей

После создания проекта:

1. **Перейти в** Settings → API
2. **Скопировать три параметра:**

   ```
   Project URL: https://xxxxxxxxxxxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (секретный!)
   ```

3. **Сохранить в надежное место** (понадобятся для настройки)

---

## 📝 Шаг 3: Обновление конфигурации в коде

### 3.1 Обновить файл `/utils/supabase/info.ts`

```typescript
// Извлекаем Project ID из URL
// Если URL: https://abcdefghijk.supabase.co
// То Project ID: abcdefghijk

export const projectId = 'ВСТАВИТЬ_СЮДА_PROJECT_ID';
export const publicAnonKey = 'ВСТАВИТЬ_СЮДА_ANON_PUBLIC_KEY';
```

**Пример:**
```typescript
export const projectId = 'xyzabc123456';
export const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMzQ1NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk...';
```

---

## 🚀 Шаг 4: Настройка Edge Functions

### 4.1 Установить Supabase CLI (если еще не установлен)

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Или через npm:**
```bash
npm install -g supabase
```

### 4.2 Логин в Supabase CLI

```bash
supabase login
```

Откроется браузер для авторизации.

### 4.3 Link проекта

```bash
# В корне проекта Kaizen Center
supabase link --project-ref ВСТАВИТЬ_PROJECT_ID
```

**Project ID** - это часть URL до `.supabase.co`

### 4.4 Установить секреты для Edge Functions

```bash
# OpenAI API Key (для AI функций)
supabase secrets set OPENAI_API_KEY=sk-...ваш_ключ_openai

# Supabase URL и ключи (автоматически доступны в Edge Functions)
# SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY уже настроены
```

### 4.5 Задеплоить Edge Functions

```bash
# Deploy всех функций
supabase functions deploy make-server-4c493c62

# Или deploy конкретной функции
cd supabase/functions
supabase functions deploy make-server-4c493c62
```

**Проверка деплоя:**
```bash
curl https://ВАШ_PROJECT_ID.supabase.co/functions/v1/make-server-4c493c62/health
```

Должно вернуть: `{"status":"ok"}`

---

## 🗄️ Шаг 5: Выполнение миграций БД

### 5.1 Перейти в SQL Editor

**Dashboard → SQL Editor → New Query**

### 5.2 Выполнить миграции по порядку

Скопировать и выполнить содержимое каждого файла:

#### **Миграция 1:** `001_initial_schema.sql`
```sql
-- Создание таблицы test_history
-- Скопировать весь код из файла и нажать RUN
```

#### **Миграция 2:** `002_add_user_id_to_test_history.sql`
```sql
-- Добавление user_id
-- Скопировать и выполнить
```

#### **Миграция 3:** `003_enable_auth.sql`
```sql
-- Настройка RLS и политик
-- Скопировать и выполнить
```

#### **Миграция 4:** `004_video_tutorials.sql`
```sql
-- Видео-туториалы и Storage
-- Скопировать и выполнить
```

### 5.3 Проверка миграций

**Table Editor:** Должны появиться таблицы:
- ✅ `test_history`
- ✅ `tutorials`
- ✅ `user_video_progress`

**Storage:** Должен появиться bucket:
- ✅ `tutorials`

---

## 👤 Шаг 6: Создание первого админа

### 6.1 Перейти в Authentication

**Dashboard → Authentication → Users → Add User**

### 6.2 Создать админа

- **Email:** `admin@kaizen.local` (или ваш email)
- **Password:** Придумайте надежный пароль
- **Auto Confirm User:** ✅ Включить

### 6.3 Нажать "Create User"

Теперь можно логиниться через веб-интерфейс как админ!

---

## 🎥 Шаг 7: Загрузка видео-туториалов (опционально)

### 7.1 Перейти в Storage

**Dashboard → Storage → tutorials**

### 7.2 Upload видео

- Нажать "Upload file"
- Выбрать видео файлы (mp4, webm)
- Дождаться загрузки

### 7.3 Добавить метаданные

**Table Editor → tutorials → Insert Row**

Заполнить:
- **title:** "Введение в Kaizen Center"
- **description:** "Обзор функций"
- **duration:** 300 (в секундах)
- **storage_path:** "intro.mp4" (имя файла в Storage)
- **order_index:** 1

**Или через SQL:**
```sql
INSERT INTO tutorials (title, description, duration, storage_path, order_index)
VALUES ('Введение в Kaizen Center', 'Обзор возможностей', 300, 'intro.mp4', 1);
```

---

## ✅ Шаг 8: Проверка работы

### 8.1 Проверить API

```bash
# Health check
curl https://ВАSH_PROJECT_ID.supabase.co/functions/v1/make-server-4c493c62/health

# Test templates
curl https://ВАSH_PROJECT_ID.supabase.co/functions/v1/make-server-4c493c62/ai-test/test-templates \
  -H "Authorization: Bearer ВАSH_ANON_KEY"
```

### 8.2 Запустить приложение

```bash
npm run dev
```

### 8.3 Проверить функции

1. **Авторизация** - в браузере откроется форма логина (если не в Telegram)
2. **История тестов** - должна загружаться пустая или с данными
3. **Профиль** - показывает данные пользователя
4. **Туториалы** - показывает загруженные видео

---

## 🔒 Безопасность

### ⚠️ ВАЖНО: Никогда не коммитить в Git!

Добавьте в `.gitignore`:
```
# Supabase secrets
.env
.env.local
supabase/.env
utils/supabase/info.ts
```

### Использовать Environment Variables

Для продакшена лучше использовать переменные окружения:

```typescript
// utils/supabase/info.ts
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'fallback';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback';
```

Файл `.env.local`:
```
VITE_SUPABASE_PROJECT_ID=xyzabc123456
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 🐛 Troubleshooting

### Ошибка: "Failed to fetch"
✅ Проверьте что Edge Functions задеплоены  
✅ Проверьте URL и API ключи в коде  
✅ Проверьте CORS настройки в Edge Function

### Ошибка: "relation does not exist"
✅ Выполните все миграции по порядку  
✅ Проверьте что таблицы созданы в Table Editor

### Ошибка: "Invalid API key"
✅ Используйте `anon public` ключ для фронтенда  
✅ `service_role` ключ только для backend/Edge Functions

### Edge Functions не работают
✅ Проверьте что установлен Supabase CLI  
✅ Проверьте что проект залинкован: `supabase link`  
✅ Задеплойте функции заново: `supabase functions deploy`

### Видео не загружаются
✅ Проверьте что Storage bucket `tutorials` создан  
✅ Проверьте политики доступа к Storage  
✅ Проверьте что `storage_path` совпадает с именем файла

---

## 📊 Полезные команды Supabase CLI

```bash
# Проверить статус проекта
supabase status

# Посмотреть логи функций
supabase functions serve --env-file ./supabase/.env.local

# Список секретов
supabase secrets list

# Удалить секрет
supabase secrets unset SECRET_NAME

# Генерация TypeScript типов из БД
supabase gen types typescript --local > types/supabase.ts
```

---

## 🎉 Готово!

Теперь ваш проект полностью подключен к Supabase:

✅ База данных настроена  
✅ Edge Functions задеплоены  
✅ Авторизация работает  
✅ Storage готов к использованию  
✅ Миграции выполнены  

Можно начинать разработку! 🚀

---

## 📞 Дополнительные ресурсы

- **Supabase Docs:** https://supabase.com/docs
- **Edge Functions Guide:** https://supabase.com/docs/guides/functions
- **Storage Guide:** https://supabase.com/docs/guides/storage
- **Auth Guide:** https://supabase.com/docs/guides/auth

**Support:** https://supabase.com/dashboard/support

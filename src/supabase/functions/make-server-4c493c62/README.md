# Server API Documentation

Серверная часть приложения Kaidzen, построенная на Hono и Deno.

## Структура модулей

```
server/
├── index.tsx              # Точка входа, композиция всех роутов
├── types.ts               # TypeScript типы для A3 отчетов
├── prompts.ts             # Шаблоны промптов для OpenAI
├── openai-client.ts       # Клиент для работы с OpenAI API
├── a3-reports-routes.ts   # Роуты для работы с A3 отчетами
├── kv_store.tsx           # Утилита для работы с KV хранилищем (защищен)
└── README.md              # Эта документация
```

## Модули

### `index.tsx`
Главный файл приложения. Настраивает middleware (CORS, logger) и подключает роуты.

### `types.ts`
Общие TypeScript типы:
- `A3ReportInput` - входные данные (5W1H)
- `A3ReportOutput` - результат генерации AI
- `A3Report` - полный отчет с метаданными

### `prompts.ts`
Функция `buildA3Prompt()` - формирует промпт для OpenAI на основе входных данных пользователя.

### `openai-client.ts`
Функция `generateWithOpenAI()` - отправляет запрос к OpenAI API и возвращает структурированный ответ.

### `a3-reports-routes.ts`
CRUD операции для A3 отчетов:
- `POST /generate` - генерация нового отчета
- `GET /` - получение всех отчетов
- `GET /:id` - получение отчета по ID
- `DELETE /:id` - удаление отчета

## API Endpoints

Базовый URL: `/make-server-4c493c62`

### Health Check
```
GET /health
```

### A3 Reports

#### Генерация отчета
```
POST /a3-reports/generate
Body: {
  "input": {
    "what": "string",
    "where": "string",
    "when": "string",
    "who": "string",
    "why": "string",
    "how": "string"
  }
}
Response: { "report": A3Report }
```

#### Получить все отчеты
```
GET /a3-reports
Response: { "reports": A3Report[] }
```

#### Получить отчет по ID
```
GET /a3-reports/:id
Response: { "report": A3Report }
```

#### Удалить отчет
```
DELETE /a3-reports/:id
Response: { "success": true }
```

## Environment Variables

- `OPENAI_API_KEY` - API ключ для OpenAI (обязательно)
- `SUPABASE_URL` - URL Supabase проекта
- `SUPABASE_SERVICE_ROLE_KEY` - Service role ключ Supabase

## Хранилище данных

Используется KV Store с префиксом `a3-report:` для хранения отчетов.

## Добавление новых модулей

1. Создайте файл в директории `/supabase/functions/server/`
2. Экспортируйте необходимые функции/роуты
3. Импортируйте в `index.tsx` и подключите через `app.route()`

Пример:
```typescript
// new-feature-routes.ts
import { Hono } from "npm:hono";

export const newFeatureRouter = new Hono();
newFeatureRouter.get("/", (c) => c.json({ message: "Hello" }));

// index.tsx
import { newFeatureRouter } from "./new-feature-routes.ts";
app.route("/make-server-4c493c62/new-feature", newFeatureRouter);
```

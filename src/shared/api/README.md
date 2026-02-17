# Shared API

Директория для базового HTTP-клиента и низкоуровневых утилит для работы с API.

## 📁 Структура:

- `client.ts` - базовый HTTP-клиент (fetch wrapper)

## ⚠️ Важно (FSD):

Этот слой **НЕ ДОЛЖЕН** содержать бизнес-логику!

- ✅ Базовый fetch/axios wrapper
- ✅ Interceptors
- ✅ Конфигурация endpoint'ов
- ❌ Методы для конкретных entities (должны быть в `entities/*/api/`)
- ❌ Типы бизнес-сущностей (должны быть в `entities/*/model/`)

## Пример правильного использования:

```typescript
// ✅ Правильно: shared/api/client.ts
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Базовая логика запроса
}

// ✅ Правильно: entities/a3-report/api/a3ReportApi.ts
import { fetchAPI } from '../../../shared/api/client';
export async function getAllA3Reports() {
  return fetchAPI('/a3-reports');
}
```
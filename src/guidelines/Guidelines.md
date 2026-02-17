# Feature-Sliced Design (FSD) — Инструкция

## 1. Структура: 3 уровня иерархии

```
app/
pages/
  home/
    ui/
    api/
widgets/
  header/
    ui/
features/
  auth/
    ui/
    api/
    model/
entities/
  user/
    ui/
    model/
    api/
shared/
  ui/
  lib/
  api/
```

**Иерархия:** Layer → Slice → Segment

---

## 2. Слои (от верхнего к нижнему)

| Слой | Назначение | Содержит слайсы? |
|------|-----------|------------------|
| **app** | Инициализация, роутинг, конфиг приложения | Нет, только сегменты |
| **pages** | Полные страницы | Да |
| **widgets** | Крупные переиспользуемые UI-блоки | Да |
| **features** | Бизнес-функции (авторизация, поиск) | Да |
| **entities** | Бизнес-сущности (user, product, order) | Да |
| **shared** | Переиспользуемый код (UI-кит, хелперы) | Нет, только сегменты |

---

## 3. Сегменты (стандартные)

Внутри каждого слайса используются технические разделы:

- **ui/** — React компоненты, стили, форматтеры дат
- **model/** — состояние, валидация, бизнес-логика, интерфейсы
- **api/** — запросы к бэкенду, типы данных, мапперы
- **lib/** — внутренние библиотеки для этого слайса
- **config/** — конфигурация, фича-флаги

---

## 4. Правило импорта: только вниз ↓

Модуль может импортировать только слои ниже себя:

```typescript
// ✅ ПРАВИЛЬНО
// pages/home/ может импортировать:
import { Header } from 'widgets/header';           // ниже
import { useAuth } from 'features/auth/model';     // ниже
import { User } from 'entities/user';              // ниже
import { Button } from 'shared/ui/button';         // ниже

// ❌ НЕПРАВИЛЬНО
import { HomePage } from 'pages/home';             // features не может импортировать pages
import { OtherFeature } from 'features/checkout';  // features не может импортировать features
```

---

## 5. Правило изоляции: слайсы не видят друг друга

Слайсы одного слоя изолированы:

```typescript
// ❌ НЕПРАВИЛЬНО
// features/auth/ui/LoginForm.tsx
import { validateEmail } from 'features/checkout/lib/validators';

// ✅ ПРАВИЛЬНО
// shared/lib/validators.ts
export const validateEmail = (email) => { /* ... */ };

// features/auth/ui/LoginForm.tsx
import { validateEmail } from 'shared/lib/validators';
```

---

## 6. Public API через index.ts

Каждый слайс должен иметь `index.ts`, который определяет, что видно снаружи:

```typescript
// features/auth/index.ts
export { LoginForm } from './ui/LoginForm';
export { useAuth } from './model/useAuth';
// ❌ Внутренние детали НЕ экспортируем
```

**Правило:** Импортируй только из публичного API:

```typescript
// ✅ ПРАВИЛЬНО
import { LoginForm } from 'features/auth';

// ❌ НЕПРАВИЛЬНО (обход Public API)
import { LoginForm } from 'features/auth/ui/LoginForm';
```

---

## 7. Кросс-импорты между сущностями (@x-нотация)

Только для **Entities** — когда сущности связаны:

```
entities/
  song/
    @x/
      artist.ts        ← Public API для entities/artist/
    model/
      song.ts
    index.ts

  artist/
    model/
      artist.ts
    index.ts
```

**Использование:**

```typescript
// entities/artist/model/artist.ts
import type { Song } from 'entities/song/@x/artist';

export interface Artist {
  name: string;
  songs: Song[];
}
```

⚠️ **Только на слое Entities!**

---

## 8. Относительные vs абсолютные импорты

**Внутри слайса** → относительные импорты:
```typescript
// features/auth/ui/LoginForm.tsx
import { useAuth } from '../model/useAuth';  // относительный
```

**Между слайсами** → абсолютные импорты:
```typescript
// pages/home/ui/HomePage.tsx
import { Header } from 'widgets/header';     // абсолютный
```

**Причина:** избежать циклических зависимостей через barrel-файлы

---

## 9. Примеры структур

### Простая фича (авторизация)

```
features/auth/
  ├── ui/
  │   ├── LoginForm.tsx
  │   └── RegisterForm.tsx
  ├── model/
  │   ├── useAuth.ts
  │   └── authSchema.ts
  ├── api/
  │   └── authApi.ts
  └── index.ts
```

### Сущность (юзер)

```
entities/user/
  ├── ui/
  │   ├── UserCard.tsx
  │   └── UserAvatar.tsx
  ├── model/
  │   ├── user.ts
  │   └── userSchema.ts
  ├── api/
  │   └── userApi.ts
  └── index.ts
```

### Страница

```
pages/profile/
  ├── ui/
  │   └── ProfilePage.tsx
  ├── api/
  │   └── profileApi.ts
  └── index.ts
```

---

## 10. Когда что использовать

| Задача | Где? |
|--------|------|
| Глобальные стили, роутинг, конфиг | `app/` |
| Полная страница приложения | `pages/` |
| Блок, переиспользуемый на нескольких страницах | `widgets/` |
| Функция, которая нужна на нескольких страницах | `features/` |
| Сущность бизнеса (user, product, order) | `entities/` |
| Кнопка, утилиты, компоненты без бизнеса | `shared/` |

---

## 11. Частые ошибки

❌ **Ошибка 1:** Импорт между слайсами одного слоя
```typescript
import { cart } from 'features/cart';  // features не импортирует features!
```

❌ **Ошибка 2:** Wildcard экспорты в Public API
```typescript
export * from './ui/Button';  // Плохо, явно перечисляй
```

❌ **Ошибка 3:** Циклический импорт через index
```typescript
// pages/home/ui/HomePage.tsx
import { something } from '../';  // ← может привести к циклу
```

❌ **Ошибка 4:** @x-нотация вне Entities
```typescript
// features/auth/@x/checkout.ts  ← Только для entities!
```

---

## 12. Чек-лист для кода

- [ ] Импорты идут только вниз по слоям?
- [ ] Слайсы одного слоя не знают друг о друге?
- [ ] Весь Public API в `index.ts`?
- [ ] Внутри слайса — относительные импорты?
- [ ] Между слайсами — абсолютные импорты?
- [ ] Нет wildcard-экспортов?
- [ ] @x-нотация только в Entities?

---

## 13. Инструменты

Проверка архитектуры:
- **Steiger** — линтер FSD
- **eslint-plugin-boundaries** — контроль зависимостей
- **eslint-plugin-import** — проверка импортов

---

## Вывод

**FSD = Иерархия + Изоляция + Публичный API**

Слои → Слайсы → Сегменты. Только вниз. Один слайс — одна идея.
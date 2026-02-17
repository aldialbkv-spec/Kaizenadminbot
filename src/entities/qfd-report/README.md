# QFD Report Entity

Бизнес-сущность для работы с QFD (Quality Function Deployment) отчетами - "Дом качества".

## Структура

```
entities/qfd-report/
├── model/
│   ├── types.ts        # TypeScript типы для QFD
│   └── constants.ts    # Константы (символы, лимиты)
├── api/
│   └── qfdApi.ts       # API клиент для взаимодействия с backend
├── index.ts            # Public API
└── README.md
```

## Основные типы

### `CustomerRequirement`
Требование клиента (WHAT)
- `id` - уникальный идентификатор
- `text` - текст требования
- `category` - категория (Функциональность, Удобство, Качество, etc.)
- `importance` - важность по шкале 1-10
- `relativeImportance` - относительная важность в %

### `TechnicalCharacteristic`
Техническая характеристика (HOW)
- `id` - уникальный идентификатор
- `text` - описание характеристики
- `category` - направление (Производительность, Функциональность, etc.)
- `unit` - единица измерения
- `direction` - направление улучшения (↑, ↓, ○)
- `absoluteWeight` - абсолютный вес
- `relativeWeight` - относительный вес в %
- `rank` - ранг важности

### `QFDReport`
Полный QFD отчет

## Константы

- `MAX_REQUIREMENTS` = 10 - максимум требований клиентов
- `MAX_CHARACTERISTICS` = 10 - максимум технических характеристик
- `MAX_COMPETITORS` = 3 - максимум конкурентов
- `RELATIONSHIP_SYMBOLS` - символы для матрицы взаимосвязей (●, ○, △)
- `CORRELATION_SYMBOLS` - символы для корреляций (++, +, -, --)
- `DIRECTION_SYMBOLS` - символы направлений (↑, ↓, ○)

## API методы

### `generateQFDLists(input: QFDListsInput): Promise<QFDLists>`
Генерирует списки требований клиентов и технических характеристик (этап 1).

**Параметры:**
- `companyDescription` - описание компании
- `product` - продукт/услуга

**Возвращает:** Объект с двумя массивами (`customerRequirements`, `technicalCharacteristics`)

### `generateQFDReport(input: QFDReportInput): Promise<QFDReport>`
Генерирует полный QFD отчет (этап 2).

**Параметры:**
- `companyDescription` - описание компании
- `product` - продукт/услуга
- `customerRequirements` - утвержденные требования клиентов
- `technicalCharacteristics` - утвержденные технические характеристики
- `competitorsEnabled` - включен ли конкурентный анализ
- `competitors` - данные о конкурентах (опционально)

**Возвращает:** Полный QFD отчет

### `getQFDReport(id: string): Promise<QFDReport>`
Получает QFD отчет по ID.

### `getAllQFDReports(): Promise<QFDReport[]>`
Получает все QFD отчеты.

## Использование

```typescript
import { 
  generateQFDLists, 
  generateQFDReport,
  type CustomerRequirement,
  type TechnicalCharacteristic
} from 'entities/qfd-report';

// Этап 1: Генерация списков
const lists = await generateQFDLists({
  companyDescription: 'IT компания, разрабатывающая SaaS решения',
  product: 'CRM система для малого бизнеса'
});

// Редактирование списков пользователем...

// Этап 2: Генерация отчета
const report = await generateQFDReport({
  companyDescription: 'IT компания, разрабатывающая SaaS решения',
  product: 'CRM система для малого бизнеса',
  customerRequirements: lists.customerRequirements,
  technicalCharacteristics: lists.technicalCharacteristics,
  competitorsEnabled: true,
  competitors: {
    competitor1: 'Salesforce',
    competitor2: 'HubSpot',
    competitor3: 'Pipedrive'
  }
});
```

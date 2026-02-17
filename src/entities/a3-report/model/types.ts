// Input данные (5W1H)
export interface A3ReportInput {
  what: string;      // Что конкретно произошло
  where: string;     // Где? В каком конкретном месте?
  when: string;      // Когда, на каком этапе это произошло?
  who: string;       // Кто выявил проблему?
  why: string;       // Почему это происходит?
  how: string;       // Как часто и как много? (последствия в цифрах)
}

// Диаграмма Исикавы (6M категории)
export interface IshikawaDiagram {
  man: string[];           // Человек (люди, навыки, обучение)
  machine: string[];       // Оборудование (техника, инструменты)
  method: string[];        // Метод (процессы, процедуры)
  material: string[];      // Материал (сырье, комплектующие)
  measurement: string[];   // Измерение (метрики, контроль качества)
  environment: string[];   // Окружение (условия работы, среда)
}

// Одна ветка анализа "5 Why" для конкретной причины
export interface FiveWhyBranch {
  initialCause: string;    // Начальная причина из диаграммы Исикавы
  whyChain: string[];      // Цепочка вопросов "Почему?" (обычно 5 шагов)
  rootCause: string;       // Коренная причина (результат анализа)
}

// Анализ коренных причин (структурированный)
export interface RootCauseAnalysis {
  ishikawa: IshikawaDiagram;           // Диаграмма Исикавы с категориями 6M
  fiveWhyBranches: FiveWhyBranch[];    // Несколько веток "5 Why" для ключевых причин
}

// Output данные (результат генерации)
export interface A3ReportOutput {
  title: string;                           // Краткое название отчета (генерируется GPT)
  problemStatement: string;                // Формулировка проблемы
  currentState: string;                     // Текущее состояние (это и есть проблема)
  rootCauseAnalysis: RootCauseAnalysis;    // Анализ причин (структурированный)
  targetCondition: string;                  // Целевое состояние (SMART)
  countermeasuresPlan: Countermeasure[];    // План контрмер
  standardize: string;                      // Стандартизация (генерируется на основе контрмер)
}

// Контрмера для плана действий
export interface Countermeasure {
  action: string;        // Контрмера
  deadline: string;      // Срок исполнения
  responsible: string;   // Ответственный
  kpi: string;          // KPI результата
}

// Полный A3 отчет
export interface A3Report {
  id: string;
  title: string;
  input: A3ReportInput;
  output?: A3ReportOutput;
  status: 'draft' | 'generated' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

// Состояние генерации
export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';
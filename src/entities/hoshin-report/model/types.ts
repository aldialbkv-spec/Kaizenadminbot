// Input данные для Hoshin Kanri
export interface HoshinReportInput {
  mission: string; // Миссия компании
  vision: string; // Видение компании
  values: string; // Ценности компании
  goals: string; // Цели компании на год
}

// Тактическая задача в стратегии Хосин Канри
export interface HoshinTacticalTask {
  goalName: string; // Название годовой цели
  tacticalTask: string; // Описание тактической задачи
  deadline: string; // Срок исполнения
  responsible: string; // Ответственное лицо
  expectedResult: string; // Ожидаемый результат в числовом выражении
}

// Output данные (результат генерации)
export interface HoshinReportOutput {
  analysis: string; // Анализ связи элементов стратегии
  tasks: HoshinTacticalTask[]; // Список тактических задач
}

// Полный Hoshin Kanri отчет
export interface HoshinReport {
  id: string;
  title: string;
  input: HoshinReportInput;
  output?: HoshinReportOutput;
  status: 'draft' | 'generated' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

// Состояние генерации
export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

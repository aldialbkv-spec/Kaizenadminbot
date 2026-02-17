/**
 * Элемент истории пройденных тестов
 * data содержит тот же объект что сохраняется в KV store
 */
export interface TestHistoryItem {
  id: string;
  type: 'a3' | 'vsm' | 'qfd' | 'hoshin' | 'custom';
  data: any; // Полный объект отчета из KV store
  created_at: string;
}

/**
 * Схема теста - описывает какие данные нужны
 */
export interface TestSchema {
  inputs: string[];
  inputLabels: Record<string, string>;
  outputs: Record<string, 'text' | 'table'>;
}

/**
 * Пользовательские данные
 */
export interface UserInputs {
  [key: string]: string;
}

/**
 * Результат теста
 */
export interface TestResult {
  [key: string]: string | Array<Record<string, string>>;
}

/**
 * Конфигурация AI теста
 */
export interface AiTestConfig {
  prompt: string;
  schema: TestSchema;
}
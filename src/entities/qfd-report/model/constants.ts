// Значения для матрицы взаимосвязей
export const RELATIONSHIP_SYMBOLS = {
  STRONG: '9',
  MEDIUM: '3',
  WEAK: '1',
  NONE: '',
} as const;

// Символы для корреляционной матрицы
export const CORRELATION_SYMBOLS = {
  STRONG_POSITIVE: '++',
  POSITIVE: '+',
  NEGATIVE: '-',
  STRONG_NEGATIVE: '--',
  NONE: '',
} as const;

// Направления улучшения
export const DIRECTION_SYMBOLS = {
  UP: '↑',      // больше лучше
  DOWN: '↓',    // меньше лучше
  TARGET: '○',  // есть оптимум
} as const;

// Максимальное количество пунктов
export const MAX_REQUIREMENTS = 10;
export const MAX_CHARACTERISTICS = 10;

// Максимальное количество конкурентов
export const MAX_COMPETITORS = 3;

// Шкала важности
export const IMPORTANCE_SCALE = {
  MIN: 1,
  MAX: 10,
} as const;

// Шкала конкурентной оценки
export const COMPETITIVE_RATING_SCALE = {
  MIN: 1,
  MAX: 5,
} as const;

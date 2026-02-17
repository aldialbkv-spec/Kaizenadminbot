// Требование клиента (WHAT)
export interface CustomerRequirement {
  id: string;
  text: string;
  category: string;
  importance?: number; // Оценка важности: 10 = самое важное, 1 = самое неважное
  relativeImportance?: number; // %, заполняется на этапе 2
}

// Техническая характеристика (HOW)
export interface TechnicalCharacteristic {
  id: string;
  text: string;
  category: string;
  unit: string; // единица измерения
  direction: '↑' | '↓' | '○'; // направление улучшения
  absoluteWeight?: number; // рассчитывается на этапе 2
  relativeWeight?: number; // %
  rank?: number; // ранг важности
  currentValue?: string;
  targetValue?: string;
  targetDate?: string;
}

// Сила связи в матрице
export type RelationshipStrength = '9' | '3' | '1' | '';
export const RelationshipValues: Record<RelationshipStrength, number> = {
  '9': 9, // сильная
  '3': 3, // средняя
  '1': 1, // слабая
  '': 0,  // нет связи
};

// Матрица взаимосвязей
export interface RelationshipMatrix {
  // ключ: `${requirementId}_${characteristicId}`
  [key: string]: RelationshipStrength;
}

// Корреляция между техническими характеристиками
export type CorrelationType = '++' | '+' | '-' | '--' | '';
export interface Correlation {
  characteristic1Id: string;
  characteristic2Id: string;
  type: CorrelationType;
  description: string;
}

// Конкурентная оценка (если включен анализ)
export interface CompetitiveRating {
  requirementId: string;
  ourProduct: number; // 1-5
  competitor1?: number;
  competitor2?: number;
  competitor3?: number;
  improvementNeeded?: number | null; // на сколько улучшать (лучший конкурент - наш продукт), null если не требуется
}

// Действие/задача для улучшения характеристики
export interface Action {
  id: string;
  action: string; // Описание действия
  requirementIds: string[]; // ID требований клиентов, на которые влияет
  characteristicId: string; // ID технической характеристики
  impact: number; // Влияние на характеристику в числовом выражении (например, улучшение на X%)
  duration: string; // Время реализации (например, "2-3 недели", "1 месяц")
  responsible: string; // Ответственный отдел/команда
}

// Полный QFD отчет (этап 2)
export interface QFDReport {
  id: string;
  companyDescription: string;
  productName?: string; // Удобное название для отображения в списке
  
  // Списки (отредактированные пользователем)
  customerRequirements: CustomerRequirement[];
  technicalCharacteristics: TechnicalCharacteristic[];
  
  // Конкурентный анализ (опционально)
  competitorsEnabled: boolean;
  competitors?: {
    competitor1?: string;
    competitor2?: string;
    competitor3?: string;
  };
  
  // Результаты анализа
  relationshipMatrix: RelationshipMatrix;
  correlations: Correlation[];
  competitiveRatings?: CompetitiveRating[];
  
  // Стратегические выводы
  topPriorities?: string[]; // TOP-5 технических характеристик
  quickWins?: string[];
  criticalTradeoffs?: string[];
  competitiveStrategy?: {
    strengths: string[];
    gaps: string[];
    opportunities: string[];
  };
  
  // План действий
  actionPlan?: {
    phase1: string; // месяц 1-2
    phase2: string; // месяц 3-4
    phase3: string; // месяц 5-6
  };
  
  // Список конкретных действий для топ-3 характеристик
  actions?: Action[];
  
  createdAt: string;
}

// Данные для генерации списков (этап 1)
export interface QFDListsInput {
  companyDescription: string;
}

// Результат этапа 1
export interface QFDLists {
  customerRequirements: CustomerRequirement[];
  technicalCharacteristics: TechnicalCharacteristic[];
}

// Данные для генерации финального отчета (этап 2)
export interface QFDReportInput {
  companyDescription: string;
  customerRequirements: CustomerRequirement[];
  technicalCharacteristics: TechnicalCharacteristic[];
  competitorsEnabled: boolean;
  competitors?: {
    competitor1?: string;
    competitor2?: string;
    competitor3?: string;
  };
}
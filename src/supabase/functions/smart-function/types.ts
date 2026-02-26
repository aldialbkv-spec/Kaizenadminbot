// Input данные (5W1H)
export interface A3ReportInput {
  what: string;
  where: string;
  when: string;
  who: string;
  why: string;
  how: string;
}

// Диаграмма Исикавы (6M категории)
export interface IshikawaDiagram {
  man: string[];           // Человек
  machine: string[];       // Оборудование
  method: string[];        // Метод
  material: string[];      // Материал
  measurement: string[];   // Измерение
  environment: string[];   // Окружение
}

// Одна ветка анализа "5 Why"
export interface FiveWhyBranch {
  initialCause: string;
  whyChain: string[];
  rootCause: string;
}

// Анализ коренных причин
export interface RootCauseAnalysis {
  ishikawa: IshikawaDiagram;
  fiveWhyBranches: FiveWhyBranch[];
}

// Output данные (результат генерации)
export interface A3ReportOutput {
  title: string;
  problemStatement: string;
  currentState: string;
  rootCauseAnalysis: RootCauseAnalysis;
  targetCondition: string;
  countermeasuresPlan: Array<{
    action: string;
    deadline: string;
    responsible: string;
    kpi: string;
  }>;
  standardize: string;
}

// Полный A3 отчет
export interface A3Report {
  id: string;
  title: string;
  input: A3ReportInput;
  output?: A3ReportOutput;
  status: 'draft' | 'generated' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// VSM Input данные
export interface VsmInput {
  companyName: string;
  companyActivity: string;
  processToImprove: string;
}

// Одна операция в пооперационной диаграмме
export interface OperationDiagramRow {
  stage: string;
  description: string;
  operationTime: string;
  waitTime: string;
  responsible: string;
  problems: string;
  addsValue: string;
  hasWaste: string;
}

// Одна строка в диаграмме загрузки операторов
export interface OperatorLoadRow {
  operator: string;
  usefulLoad: number;
  waste: number;
  comment: string;
}

// Мероприятие Just in Time
export interface JitMeasure {
  principle: string;
  action: string;
  deadline: string;
  responsible: string;
  expectedResult: string;
}

// VSM Output данные
export interface VsmOutput {
  asIsMap: OperationDiagramRow[];
  operatorLoad: OperatorLoadRow[];
  spaghettiDiagram: string;
  wasteTable: string;
  jitMeasures: JitMeasure[];
  toBeMap: string;
}

// Полная VSM карта
export interface ValueStreamMap {
  id: string;
  title: string;
  input: VsmInput;
  output: VsmOutput;
  status: 'draft' | 'generated';
  createdAt: string;
  updatedAt: string;
}

// QFD типы
export interface CustomerRequirement {
  id: string;
  text: string;
  category: string;
  importance?: number;
  relativeImportance?: number;
}

export interface TechnicalCharacteristic {
  id: string;
  text: string;
  category: string;
  unit: string;
  direction: '↑' | '↓' | '○';
  absoluteWeight?: number;
  relativeWeight?: number;
  rank?: number;
  currentValue?: string;
  targetValue?: string;
  targetDate?: string;
}
export interface VsmInput {
  companyName?: string;
  companyActivity: string;
  processToImprove: string;
}

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

export interface OperatorLoadRow {
  operator: string;
  usefulLoad: number;
  waste: number;
  comment: string;
}

export interface SpaghettiZone {
  id: string;
  name: string;
  type: 'storage' | 'office' | 'production' | 'warehouse';
}

export interface SpaghettiRoute {
  from: string;
  to: string;
  distance: string;
  frequency: string;
  wasteType: 'transport' | 'motion' | 'waiting';
  description: string;
}

export interface SpaghettiDiagram {
  zones: SpaghettiZone[];
  routes: SpaghettiRoute[];
  summary: string;
}

export interface JitMeasure {
  principle: string;
  action: string;
  deadline: string;
  responsible: string;
  expectedResult: string;
}

export interface VsmOutput {
  asIsMap: OperationDiagramRow[];
  operatorLoad: OperatorLoadRow[];
  spaghettiDiagram: SpaghettiDiagram;
  wasteTable: string;
  jitMeasures: JitMeasure[];
  toBeMap: string;
}

export interface ValueStreamMap {
  id: string;
  title: string;
  input: VsmInput;
  output: VsmOutput;
  status: 'draft' | 'generated';
  createdAt: string;
  updatedAt: string;
}
export type {
  CustomerRequirement,
  TechnicalCharacteristic,
  RelationshipStrength,
  RelationshipMatrix,
  CorrelationType,
  Correlation,
  CompetitiveRating,
  Action,
  QFDReport,
  QFDListsInput,
  QFDLists,
  QFDReportInput,
} from './model/types';

export { RelationshipValues } from './model/types';

export {
  RELATIONSHIP_SYMBOLS,
  CORRELATION_SYMBOLS,
  DIRECTION_SYMBOLS,
  MAX_REQUIREMENTS,
  MAX_CHARACTERISTICS,
  MAX_COMPETITORS,
  IMPORTANCE_SCALE,
  COMPETITIVE_RATING_SCALE,
} from './model/constants';

export {
  searchCompanyInfo,
  improveDescription,
  generateQFDLists,
  generateQFDReport,
  getQFDReport,
  getAllQFDReports,
  deleteQFDReport,
} from './api/qfdApi';
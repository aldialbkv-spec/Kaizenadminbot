import type { A3Report, A3ReportInput } from '../model/types';
import { fetchAPI } from '../../../shared/api/client';

/**
 * API методы для работы с A3 отчетами
 * В соответствии с FSD, бизнес-логика API находится в слое entities
 */

export async function generateA3Report(input: A3ReportInput): Promise<A3Report> {
  const data = await fetchAPI('/a3-reports/generate', {
    method: 'POST',
    body: JSON.stringify({ input }),
  });

  return data.report;
}

export async function getAllA3Reports(): Promise<A3Report[]> {
  const data = await fetchAPI('/a3-reports');
  return data.reports;
}

export async function getA3ReportById(id: string): Promise<A3Report> {
  const data = await fetchAPI(`/a3-reports/${id}`);
  return data.report;
}

export async function deleteA3Report(id: string): Promise<void> {
  await fetchAPI(`/a3-reports/${id}`, {
    method: 'DELETE',
  });
}

// Deprecated: старый API объект (для обратной совместимости)
// TODO: удалить после миграции всех компонентов на прямые импорты
export const a3ReportApi = {
  getAll: getAllA3Reports,
  getById: getA3ReportById,
  delete: deleteA3Report,
  generate: generateA3Report,
};
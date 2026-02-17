import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { 
  QFDListsInput, 
  QFDLists, 
  QFDReportInput, 
  QFDReport 
} from '../model/types';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4c493c62/qfd`;

// Поиск информации о компании через AI
export async function searchCompanyInfo(companyName: string): Promise<{
  found: boolean;
  companyName: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  suggestion?: string;
}> {
  const response = await fetch(`${API_URL}/search-company`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ companyName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search company information');
  }

  return response.json();
}

// Улучшение описания компании через AI
export async function improveDescription(description: string): Promise<{
  improvedDescription: string;
}> {
  const response = await fetch(`${API_URL}/improve-description`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to improve description');
  }

  return response.json();
}

// Генерация списков требований и характеристик (этап 1)
export async function generateQFDLists(input: QFDListsInput): Promise<QFDLists> {
  const response = await fetch(`${API_URL}/generate-lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate QFD lists');
  }

  return response.json();
}

// Генерация полного QFD отчета (этап 2)
export async function generateQFDReport(input: QFDReportInput): Promise<QFDReport> {
  const response = await fetch(`${API_URL}/generate-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate QFD report');
  }

  return response.json();
}

// Получение отчета по ID
export async function getQFDReport(id: string): Promise<QFDReport> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch QFD report');
  }

  return response.json();
}

// Получение всех отчетов
export async function getAllQFDReports(): Promise<QFDReport[]> {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch QFD reports');
  }

  return response.json();
}

// Удаление отчета
export async function deleteQFDReport(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete QFD report');
  }
}
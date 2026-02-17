import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { HoshinReport, HoshinReportInput } from '../../entities/hoshin-report';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4c493c62`;

// Генерация Hoshin Kanri отчета
export async function generateHoshinReport(input: HoshinReportInput): Promise<HoshinReport> {
  const response = await fetch(`${BASE_URL}/hoshin/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate Hoshin report: ${error}`);
  }

  return response.json();
}

// Получить список всех Hoshin отчетов
export async function getHoshinReports(): Promise<HoshinReport[]> {
  const response = await fetch(`${BASE_URL}/hoshin/list`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Hoshin reports: ${error}`);
  }

  return response.json();
}

// Получить один Hoshin отчет по ID
export async function getHoshinReport(id: string): Promise<HoshinReport> {
  const response = await fetch(`${BASE_URL}/hoshin/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Hoshin report: ${error}`);
  }

  return response.json();
}

// Удалить Hoshin отчет
export async function deleteHoshinReport(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/hoshin/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete Hoshin report: ${error}`);
  }
}

// Улучшить поле через ИИ (универсальная функция)
export async function improveHoshinInput(
  text: string,
  fieldType: 'mission' | 'vision' | 'values' | 'goals'
): Promise<string> {
  const response = await fetch(`${BASE_URL}/hoshin/improve-input`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ text, fieldType }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to improve ${fieldType}: ${error}`);
  }

  const data = await response.json();
  return data.improvedText;
}

// Типы для результата валидации
export interface ValidationCheck {
  isConsistent: boolean;
  issue: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  visionMissionCheck: ValidationCheck;
  goalsVisionCheck: ValidationCheck;
  overallCheck: ValidationCheck;
  recommendations: string[];
}

// Проверка согласованности всех элементов Хосин Канри
export async function validateHoshinConsistency(
  mission: string,
  vision: string,
  values: string,
  goals: string
): Promise<ValidationResult> {
  const response = await fetch(`${BASE_URL}/hoshin/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ mission, vision, values, goals }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to validate Hoshin consistency: ${error}`);
  }

  return response.json();
}

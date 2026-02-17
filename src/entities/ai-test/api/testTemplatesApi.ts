import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { TestTemplate, TestHistoryItem } from '../model/types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1c191bcf/ai-test`;

/**
 * Получить список шаблонов тестов
 */
export async function getTestTemplates(): Promise<TestTemplate[]> {
  const response = await fetch(`${BASE_URL}/test-templates`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch test templates: ${error}`);
  }

  return response.json();
}

/**
 * Получить историю тестов для пользователя
 */
export async function getTestHistory(userId: string | number, userRole: string): Promise<TestHistoryItem[]> {
  const response = await fetch(`${BASE_URL}/test-history?userId=${userId}&userRole=${userRole}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch test history: ${error}`);
  }

  return response.json();
}

/**
 * Сохранить результат теста в историю
 */
export async function saveTestToHistory(
  item: Omit<TestHistoryItem, 'id' | 'created_at'>,
  userId: string | number
): Promise<TestHistoryItem> {
  const response = await fetch(`${BASE_URL}/test-history`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...item, userId }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to save test to history: ${error}`);
  }

  return response.json();
}
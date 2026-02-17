import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import type { TestSchema, UserInputs, TestResult } from "../../../entities/ai-test";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4c493c62/ai-test`;

/**
 * Извлекает схему теста из промпта
 */
export async function extractSchema(prompt: string): Promise<TestSchema> {
  const response = await fetch(`${BASE_URL}/extract-schema`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Failed to extract schema:", error);
    throw new Error(error.details || error.error || "Failed to extract schema");
  }

  return response.json();
}

/**
 * Генерирует отчет на основе промпта и данных пользователя
 */
export async function generateReport(
  originalPrompt: string,
  userInputs: UserInputs,
  outputSchema: Record<string, "text" | "table">
): Promise<TestResult> {
  const response = await fetch(`${BASE_URL}/generate-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ originalPrompt, userInputs, outputSchema }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Failed to generate report:", error);
    throw new Error(error.details || error.error || "Failed to generate report");
  }

  return response.json();
}

import { fetchAPI } from '../../../shared/api/client';
import type { ValueStreamMap, VsmInput } from '../model/types';

export async function getAllVsm(): Promise<ValueStreamMap[]> {
  const response = await fetchAPI('/vsm');
  return response.maps;
}

export async function getVsmById(id: string): Promise<ValueStreamMap> {
  const response = await fetchAPI(`/vsm/${id}`);
  return response.map;
}

export async function generateVsm(input: VsmInput): Promise<ValueStreamMap> {
  const response = await fetchAPI('/vsm/generate', {
    method: 'POST',
    body: JSON.stringify({ input }),
  });
  return response.map;
}

export async function deleteVsm(id: string): Promise<void> {
  await fetchAPI(`/vsm/${id}`, {
    method: 'DELETE',
  });
}

export async function improveVsmText(text: string, context: 'activity' | 'process'): Promise<{
  improvedText: string;
}> {
  const response = await fetchAPI('/vsm/improve-text', {
    method: 'POST',
    body: JSON.stringify({ text, context }),
  });
  return response;
}
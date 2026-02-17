import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { LoginCredentials, AuthUser } from '../model/types';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/smart-function`;

/**
 * Авторизация админа через email/password
 */
export async function loginAdmin(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await fetch(`${SERVER_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[authApi] Login failed:', error);
    throw new Error(error || 'Ошибка авторизации');
  }

  const data = await response.json();
  console.log('[authApi] Login successful:', data);
  
  return data.user;
}

/**
 * Проверка существующей сессии админа
 */
export async function checkAdminSession(): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${SERVER_URL}/auth/session`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.log('[authApi] No active session');
    return null;
  }
}

/**
 * Выход из системы (для админа)
 */
export async function logoutAdmin(): Promise<void> {
  await fetch(`${SERVER_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    credentials: 'include',
  });
}
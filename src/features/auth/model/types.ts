/**
 * Типы для фичи авторизации
 */

export type UserRole = 'user' | 'admin';

export type AuthUserType = 'telegram' | 'web';

export interface AuthUser {
  id: string | number;  // Telegram ID (number) или Supabase UUID (string)
  type: AuthUserType;
  role: UserRole;
  firstName?: string;
  username?: string;
  photoUrl?: string;
  email?: string;  // Только для веб-админа
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

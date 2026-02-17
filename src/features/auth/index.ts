/**
 * Public API для фичи авторизации
 */
export type { AuthUser, UserRole, AuthUserType, LoginCredentials, AuthState } from './model/types';
export { loginAdmin, checkAdminSession, logoutAdmin } from './api/authApi';
export { LoginForm } from './ui/LoginForm';

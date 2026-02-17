import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTelegramUser } from '../../entities/user';
import { loginAdmin, checkAdminSession, logoutAdmin } from '../../features/auth';
import type { AuthUser, LoginCredentials, AuthState } from '../../features/auth';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Инициализация авторизации при загрузке
  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    console.log('[AuthProvider] Initializing auth...');
    
    // Сначала проверяем Telegram user
    const telegramUser = getTelegramUser();
    if (telegramUser) {
      console.log('[AuthProvider] Telegram user found:', telegramUser);
      const authUser: AuthUser = {
        id: telegramUser.id,
        type: 'telegram',
        role: 'user',
        firstName: telegramUser.firstName,
        username: telegramUser.username,
        photoUrl: telegramUser.photoUrl,
      };
      
      setState({
        user: authUser,
        isLoading: false,
        isAuthenticated: true,
      });
      return;
    }

    // Если не в Telegram, проверяем сессию админа
    console.log('[AuthProvider] No Telegram user, checking admin session...');
    const adminUser = await checkAdminSession();
    if (adminUser) {
      console.log('[AuthProvider] Admin session found:', adminUser);
      setState({
        user: adminUser,
        isLoading: false,
        isAuthenticated: true,
      });
      return;
    }

    // Никто не авторизован
    console.log('[AuthProvider] No active session');
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }

  async function login(credentials: LoginCredentials) {
    console.log('[AuthProvider] Logging in admin...');
    const adminUser = await loginAdmin(credentials);
    setState({
      user: adminUser,
      isLoading: false,
      isAuthenticated: true,
    });
  }

  async function logout() {
    console.log('[AuthProvider] Logging out...');
    await logoutAdmin();
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const authRouter = new Hono();

// Создаем Supabase клиент с service role для админских операций
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

/**
 * POST /auth/login
 * Авторизация админа через email/password
 */
authRouter.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('[auth/login] Login attempt for:', email);

    // Используем Supabase Auth для авторизации
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[auth/login] Login failed:', error.message);
      return c.text(error.message, 401);
    }

    if (!data.user) {
      console.error('[auth/login] No user data returned');
      return c.text('Ошибка авторизации', 401);
    }

    console.log('[auth/login] Login successful for user:', data.user.id);

    // Возвращаем данные пользователя
    const authUser = {
      id: data.user.id,
      type: 'web',
      role: 'admin', // Все веб-пользователи считаются админами
      email: data.user.email,
    };

    // Устанавливаем cookie с access_token для последующих запросов
    c.header('Set-Cookie', `access_token=${data.session.access_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);

    return c.json({ user: authUser });
  } catch (error) {
    console.error('[auth/login] Error:', error);
    return c.text('Ошибка сервера', 500);
  }
});

/**
 * GET /auth/session
 * Проверка активной сессии
 */
authRouter.get('/session', async (c) => {
  try {
    // Получаем access_token из cookie
    const cookieHeader = c.req.header('Cookie') || '';
    const accessToken = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('access_token='))
      ?.split('=')[1];

    if (!accessToken) {
      console.log('[auth/session] No access token in cookie');
      return c.text('No session', 401);
    }

    // Проверяем токен
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('[auth/session] Invalid token');
      return c.text('Invalid session', 401);
    }

    console.log('[auth/session] Valid session for user:', user.id);

    const authUser = {
      id: user.id,
      type: 'web',
      role: 'admin',
      email: user.email,
    };

    return c.json({ user: authUser });
  } catch (error) {
    console.error('[auth/session] Error:', error);
    return c.text('Ошибка сервера', 500);
  }
});

/**
 * POST /auth/logout
 * Выход из системы
 */
authRouter.post('/logout', async (c) => {
  try {
    // Очищаем cookie
    c.header('Set-Cookie', 'access_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
    
    console.log('[auth/logout] Logout successful');
    return c.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('[auth/logout] Error:', error);
    return c.text('Ошибка сервера', 500);
  }
});

export default authRouter;

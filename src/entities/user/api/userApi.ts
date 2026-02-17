import { retrieveLaunchParams } from '@tma.js/sdk-react';
import type { User, TelegramUser } from '../model/types';

/**
 * Получить данные пользователя из Telegram Web App
 */
export function getTelegramUser(): User | null {
  try {
    const launchParams = retrieveLaunchParams();
    console.log('[userApi] Launch params:', launchParams);
    
    // Получаем данные пользователя из tgWebAppData
    const tgWebAppData = launchParams?.tgWebAppData;
    if (!tgWebAppData?.user) {
      console.log('[userApi] No user data in tgWebAppData');
      return null;
    }
    
    const tgUser: TelegramUser = tgWebAppData.user;
    console.log('[userApi] Telegram user:', tgUser);
    
    // Преобразуем в наш формат
    const user: User = {
      id: tgUser.id,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      username: tgUser.username,
      photoUrl: tgUser.photo_url,
      languageCode: tgUser.language_code,
      isPremium: tgUser.is_premium,
      allowsWriteToPm: tgUser.allows_write_to_pm,
    };
    
    return user;
  } catch (error) {
    console.log('[userApi] Running outside Telegram, no user data available');
    return null;
  }
}
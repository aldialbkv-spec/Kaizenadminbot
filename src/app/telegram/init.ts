import { init } from '@tma.js/sdk-react';

/**
 * Инициализация Telegram Mini App SDK
 * Должна быть вызвана один раз при старте приложения
 */
export function initTelegramSdk() {
  try {
    init({
      // Принимать кастомные стили от Telegram клиента
      acceptCustomStyles: true,
      // Остальные параметры будут вычислены автоматически
      // на основе launch параметров
    });
    
    console.log('[Telegram SDK] Initialized successfully');
  } catch (error) {
    console.info('[Telegram SDK] Running outside Telegram environment');
    // Не бросаем ошибку, чтобы приложение работало и вне Telegram
  }
}
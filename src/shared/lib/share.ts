/**
 * Утилита для шаринга контента
 * Определяет платформу и использует нативный share API на мобильных
 * или копирует ссылку в буфер на десктопе
 */

export interface ShareData {
  title?: string;
  text?: string;
  url: string;
}

/**
 * Проверяет, доступен ли нативный Web Share API
 */
export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Копирует текст в буфер обмена
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Современный API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Делится контентом через нативный Share API или копирует ссылку
 */
export async function shareContent(data: ShareData): Promise<{
  success: boolean;
  method: 'native' | 'clipboard';
  error?: string;
}> {
  // Пробуем нативный share API (мобильные устройства)
  if (canUseNativeShare()) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return { success: true, method: 'native' };
    } catch (err) {
      // Пользователь отменил шаринг или произошла ошибка
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, method: 'native', error: 'Cancelled by user' };
      }
      // Fallback к копированию в буфер
      console.warn('Native share failed, falling back to clipboard:', err);
    }
  }
  
  // Десктоп или fallback - копируем ссылку в буфер
  const success = await copyToClipboard(data.url);
  return {
    success,
    method: 'clipboard',
    error: success ? undefined : 'Failed to copy to clipboard',
  };
}

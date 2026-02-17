import { ReactNode, useEffect } from 'react';
import { initTelegramSdk } from '../telegram/init';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Инициализируем SDK при монтировании приложения
    initTelegramSdk();
  }, []);

  return <>{children}</>;
}
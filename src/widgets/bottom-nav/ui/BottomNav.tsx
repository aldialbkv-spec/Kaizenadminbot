import { ClipboardList, History, User } from 'lucide-react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';
import type { Route } from '../../../app/routing/useRouter';

interface BottomNavProps {
  currentRoute: Route;
  navigate: (route: Route) => void;
}

export function BottomNav({ currentRoute, navigate }: BottomNavProps) {
  // Используем функцию вместо хука для получения параметров темы из Telegram
  let activeColor = 'hsl(var(--primary))';
  
  try {
    const launchParams = retrieveLaunchParams();
    console.log('[BottomNav] Launch params:', launchParams);
    
    // Получаем tgWebAppThemeParams из launch params
    if (launchParams?.tgWebAppThemeParams) {
      const theme = launchParams.tgWebAppThemeParams;
      console.log('[BottomNav] Theme params:', theme);
      
      // Используем link_color для активных элементов
      if (theme.link_color) {
        activeColor = theme.link_color;
        console.log('[BottomNav] Using Telegram link color:', activeColor);
      }
    }
  } catch (error) {
    // Если не в Telegram или SDK не инициализирован - используем дефолтный цвет
    console.log('[BottomNav] Running outside Telegram, using default color');
  }
  
  const tabs = [
    {
      id: 'test-templates' as Route,
      label: 'Тесты',
      icon: ClipboardList,
    },
    {
      id: 'test-history' as Route,
      label: 'История',
      icon: History,
    },
    {
      id: 'profile' as Route,
      label: 'Профиль',
      icon: User,
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50"
      style={{
        paddingBottom: 'calc(var(--tg-viewport-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ${
                isActive
                  ? ''
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
              style={isActive ? { color: activeColor } : undefined}
            >
              <Icon 
                className={`size-6 transition-all ${isActive ? 'scale-110' : ''}`}
              />
              <span className={`text-xs transition-all ${isActive ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
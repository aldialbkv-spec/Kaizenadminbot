import { ReactNode, useEffect, useState } from 'react';
import { AppSidebar } from '../../widgets/sidebar';
import { AppHeader } from '../../widgets/header';
import { BottomNav } from '../../widgets/bottom-nav';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import { viewport, miniApp, postEvent, retrieveLaunchParams, themeParams } from '@tma.js/sdk-react';
import type { Route } from '../routing/useRouter';

interface AppLayoutProps {
  children: ReactNode;
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  headerActions?: ReactNode;
}

export function AppLayout({ children, currentRoute, onNavigate, headerActions }: AppLayoutProps) {
  const [isMobilePlatform, setIsMobilePlatform] = useState(false);
  
  useEffect(() => {
    try {
      const lp = retrieveLaunchParams();
      console.log('[AppLayout] Launch params:', lp);
      
      // Определяем платформу
      const desktopPlatforms = ['macos', 'tdesktop', 'weba', 'web', 'webk'];
      const isMobile = !desktopPlatforms.includes(lp.platform);
      setIsMobilePlatform(isMobile);
      
      // 1. Применяем тему вручную из launch params
      if (lp?.tgWebAppThemeParams) {
        const theme = lp.tgWebAppThemeParams;
        const root = document.documentElement;
        
        if (theme.bg_color) root.style.setProperty('--background', theme.bg_color);
        if (theme.bg_color) root.style.setProperty('--card', theme.bg_color);
        if (theme.secondary_bg_color) root.style.setProperty('--secondary', theme.secondary_bg_color);
        if (theme.secondary_bg_color) root.style.setProperty('--muted', theme.secondary_bg_color);
        if (theme.section_bg_color) root.style.setProperty('--accent', theme.section_bg_color);
        if (theme.section_bg_color) root.style.setProperty('--input-background', theme.section_bg_color);
        if (theme.text_color) root.style.setProperty('--foreground', theme.text_color);
        if (theme.text_color) root.style.setProperty('--card-foreground', theme.text_color);
        if (theme.hint_color) root.style.setProperty('--muted-foreground', theme.hint_color);
        if (theme.link_color) root.style.setProperty('--sidebar-primary', theme.link_color);
        if (theme.button_color) root.style.setProperty('--primary', theme.button_color);
        if (theme.button_text_color) root.style.setProperty('--primary-foreground', theme.button_text_color);
        if (theme.destructive_text_color) root.style.setProperty('--destructive', theme.destructive_text_color);
        if (theme.header_bg_color) root.style.setProperty('--sidebar', theme.header_bg_color);
        
        // Border от цвета текста с прозрачностью
        if (theme.text_color) {
          const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          };
          try {
            root.style.setProperty('--border', hexToRgba(theme.text_color, 0.1));
          } catch (e) {
            console.log('[AppLayout] Could not convert border color');
          }
        }
        
        console.log('[AppLayout] Theme applied:', theme);
      }
      
      // 2. Mount viewport и bind CSS переменные
      if (viewport.mount.isAvailable()) {
        viewport.mount();
        viewport.bindCssVars();
        console.log('[AppLayout] Viewport mounted and bound');
      }
      
      // 3. Для мобильных - expand и sticky
      if (isMobile) {
        if (miniApp.mount.isAvailable()) {
          miniApp.mount();
        }
        
        // Expand viewport
        postEvent('web_app_expand');
        
        // Включаем sticky mode - ОФИЦИАЛЬНЫЙ метод
        postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
        
        console.log('[AppLayout] Mobile mode: expanded and sticky enabled');
      }
    } catch (error) {
      // Приложение открыто вне Telegram - это нормально
      console.log('[AppLayout] Running outside Telegram environment');
      setIsMobilePlatform(false); // Дефолт для веб-браузера
    }
    
    // Cleanup
    return () => {
      try {
        if (viewport.unmount.isAvailable()) {
          viewport.unmount();
        }
        if (miniApp.unmount.isAvailable()) {
          miniApp.unmount();
        }
      } catch (error) {
        console.log('[AppLayout] Cleanup: running outside Telegram');
      }
    };
  }, []);

  return (
    <div 
      className={`flex min-h-screen flex-col ${isMobilePlatform ? 'mobile-wrap' : ''}`}
      style={{ 
        paddingTop: 'calc(var(--tg-viewport-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))',
        minHeight: 'var(--tg-viewport-height, 100vh)',
      }}
    >
      <SidebarProvider>
        <AppSidebar currentRoute={currentRoute} onNavigate={onNavigate} />
        <SidebarInset className={`flex min-h-screen flex-col ${isMobilePlatform ? 'mobile-content' : ''}`}>
          <AppHeader currentRoute={currentRoute} onNavigate={onNavigate} actions={headerActions} />
          <main className="flex flex-1 flex-col pb-16 md:pb-0">
            {children}
          </main>
          <BottomNav currentRoute={currentRoute} navigate={onNavigate} />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
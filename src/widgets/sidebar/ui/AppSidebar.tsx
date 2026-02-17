import { Sparkles, ClipboardList, History, User, PlayCircle, Shield } from 'lucide-react';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import logoImage from 'figma:asset/bdfc16ff4761bbb7e0e83a9cff00fd830e471a43.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '../../../components/ui/sidebar';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { Route } from '../../../app/routing/useRouter';

const menuItems = [
  {
    title: 'AI Конструктор',
    url: 'ai-test' as Route,
    icon: Sparkles,
  },
  {
    title: 'Тесты',
    url: 'test-templates' as Route,
    icon: ClipboardList,
  },
  {
    title: 'История',
    url: 'test-history' as Route,
    icon: History,
  },
  {
    title: 'Обучение',
    url: 'tutorials' as Route,
    icon: PlayCircle,
  },
  {
    title: 'Профиль',
    url: 'profile' as Route,
    icon: User,
  },
];

const adminMenuItems = [
  {
    title: 'Управление видео',
    url: 'admin-tutorials' as Route,
    icon: Shield,
  },
];

interface AppSidebarProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

export function AppSidebar({ currentRoute, onNavigate }: AppSidebarProps) {
  const { user } = useAuth();
  
  // Проверка активности
  const isActive = (itemRoute: Route) => {
    return currentRoute === itemRoute;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-6 py-4 flex items-center gap-3">
          <ImageWithFallback 
            src={logoImage}
            alt="Kaizen Logo"
            className="size-8 rounded object-cover"
          />
          <h1 className="text-lg">Kaizen Center</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(item.url);
                      }}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Админ секция - только для администраторов */}
        {user?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Администрирование</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.url)}
                    >
                      <a 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(item.url);
                        }}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-6 py-4">
          <p className="text-xs text-muted-foreground">© 2025 Kaizen</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
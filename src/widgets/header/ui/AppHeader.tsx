import { SidebarTrigger } from '../../../components/ui/sidebar';
import { Separator } from '../../../components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../components/ui/breadcrumb';
import type { Route } from '../../../app/routing/useRouter';
import type { ReactNode } from 'react';

interface AppHeaderProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  actions?: ReactNode;
}

const routeConfig: Record<Route, { title: string; parent?: Route }> = {
  'ai-test': { title: 'AI Конструктор Тестов' },
  'test-templates': { title: 'Тесты' },
  'test-history': { title: 'История тестов' },
  'profile': { title: 'Профиль' },
  'reports-a3': { title: 'Отчеты A3' },
  'create-report': { title: 'Создание отчета', parent: 'test-templates' },
  'view-report': { title: 'Отчет', parent: 'reports-a3' },
  'shared-report': { title: 'Общий отчет' },
  'vsm': { title: 'Карта потока создания ценности' },
  'create-vsm': { title: 'Создание карты', parent: 'test-templates' },
  'view-vsm': { title: 'Карта потока', parent: 'vsm' },
  'qfd-reports': { title: 'Дом качества' },
  'create-qfd': { title: 'Создание QFD', parent: 'test-templates' },
  'view-qfd': { title: 'Отчет QFD', parent: 'qfd-reports' },
  'hoshin': { title: 'Хосин Канри' },
  'create-hoshin': { title: 'Создание отчета', parent: 'test-templates' },
  'view-hoshin': { title: 'Отчет Hoshin Kanri', parent: 'hoshin' },
};

export function AppHeader({ currentRoute, onNavigate, actions }: AppHeaderProps) {
  const getBreadcrumbs = () => {
    const breadcrumbs: Array<{ route: Route; title: string; isLast: boolean }> = [];
    let current: Route | undefined = currentRoute;
    
    while (current) {
      const config = routeConfig[current];
      breadcrumbs.unshift({
        route: current,
        title: config.title,
        isLast: current === currentRoute,
      });
      current = config.parent;
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-50 hidden md:flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.route} className="flex items-center gap-2">
              <BreadcrumbItem>
                {breadcrumb.isLast ? (
                  <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(breadcrumb.route);
                    }}
                  >
                    {breadcrumb.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      {actions && (
        <>
          <div className="ml-auto" />
          {actions}
        </>
      )}
    </header>
  );
}
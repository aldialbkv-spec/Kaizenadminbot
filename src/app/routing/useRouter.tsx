import { useState, useCallback, useEffect } from 'react';

export type Route = 'ai-test' | 'test-templates' | 'test-history' | 'profile' | 'tutorials' | 'admin-tutorials' | 'reports-a3' | 'create-report' | 'view-report' | 'shared-report' | 'vsm' | 'create-vsm' | 'view-vsm' | 'qfd-reports' | 'create-qfd' | 'view-qfd' | 'hoshin' | 'create-hoshin' | 'view-hoshin';

interface RouteState {
  route: Route;
  params?: Record<string, string>;
}

// Парсим URL в состояние роута
function parseUrlToRoute(pathname: string): RouteState {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return { route: 'test-templates' };
  }
  
  if (segments[0] === 'reports-a3') {
    return { route: 'reports-a3' };
  }
  
  if (segments[0] === 'ai-test') {
    return { route: 'ai-test' };
  }
  
  if (segments[0] === 'test-templates') {
    return { route: 'test-templates' };
  }
  
  if (segments[0] === 'test-history') {
    return { route: 'test-history' };
  }
  
  if (segments[0] === 'profile') {
    return { route: 'profile' };
  }
  
  if (segments[0] === 'tutorials') {
    return { route: 'tutorials' };
  }
  
  if (segments[0] === 'admin-tutorials') {
    return { route: 'admin-tutorials' };
  }
  
  if (segments[0] === 'create-report') {
    return { route: 'create-report' };
  }
  
  if (segments[0] === 'view-report' && segments[1]) {
    return { route: 'view-report', params: { id: segments[1] } };
  }
  
  if (segments[0] === 'share' && segments[1]) {
    return { route: 'shared-report', params: { id: segments[1] } };
  }
  
  if (segments[0] === 'vsm') {
    if (segments[1] === 'create') {
      return { route: 'create-vsm' };
    }
    if (segments[1]) {
      return { route: 'view-vsm', params: { id: segments[1] } };
    }
    return { route: 'vsm' };
  }
  
  if (segments[0] === 'qfd-reports') {
    if (segments[1] === 'create') {
      return { route: 'create-qfd' };
    }
    if (segments[1]) {
      return { route: 'view-qfd', params: { id: segments[1] } };
    }
    return { route: 'qfd-reports' };
  }
  
  if (segments[0] === 'hoshin') {
    if (segments[1] === 'create') {
      return { route: 'create-hoshin' };
    }
    if (segments[1]) {
      return { route: 'view-hoshin', params: { id: segments[1] } };
    }
    return { route: 'hoshin' };
  }
  
  // Дефолт - страница тестов
  return { route: 'test-templates' };
}

// Конвертируем состояние роута в URL
function routeToUrl(route: Route, params?: Record<string, string>): string {
  switch (route) {
    case 'ai-test':
      return '/ai-test';
    case 'test-templates':
      return '/test-templates';
    case 'test-history':
      return '/test-history';
    case 'profile':
      return '/profile';
    case 'tutorials':
      return '/tutorials';
    case 'admin-tutorials':
      return '/admin-tutorials';
    case 'reports-a3':
      return '/reports-a3';
    case 'create-report':
      return '/create-report';
    case 'view-report':
      return params?.id ? `/view-report/${params.id}` : '/test-templates';
    case 'shared-report':
      return params?.id ? `/share/${params.id}` : '/test-templates';
    case 'vsm':
      return '/vsm';
    case 'create-vsm':
      return '/vsm/create';
    case 'view-vsm':
      return params?.id ? `/vsm/${params.id}` : '/vsm';
    case 'qfd-reports':
      return '/qfd-reports';
    case 'create-qfd':
      return '/qfd-reports/create';
    case 'view-qfd':
      return params?.id ? `/qfd-reports/${params.id}` : '/qfd-reports';
    case 'hoshin':
      return '/hoshin';
    case 'create-hoshin':
      return '/hoshin/create';
    case 'view-hoshin':
      return params?.id ? `/hoshin/${params.id}` : '/hoshin';
    default:
      return '/test-templates';
  }
}

export function useRouter(initialRoute: Route = 'test-templates') {
  // Инициализация из текущего URL
  const [routeState, setRouteState] = useState<RouteState>(() => {
    // При первой загрузке читаем URL
    if (typeof window !== 'undefined') {
      return parseUrlToRoute(window.location.pathname);
    }
    return { route: initialRoute };
  });

  const navigate = useCallback((route: Route, params?: Record<string, string>) => {
    const newState = { route, params };
    setRouteState(newState);
    
    // Обновляем URL в адресной строке
    const url = routeToUrl(route, params);
    window.history.pushState(newState, '', url);
  }, []);

  // Обработка кнопок "Назад"/"Вперёд" браузера
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        // Если есть сохранённое состояние
        setRouteState(event.state);
      } else {
        // Если состояния нет - парсим URL
        setRouteState(parseUrlToRoute(window.location.pathname));
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Сохраняем текущее состояние для корректной работы popstate
    window.history.replaceState(routeState, '', window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [routeState]);

  return {
    currentRoute: routeState.route,
    params: routeState.params,
    navigate,
  };
}
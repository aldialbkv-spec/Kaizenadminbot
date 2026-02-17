import { QfdReportsPage } from './pages/qfd-reports';
import { HouseOfQualityPage } from './pages/house-of-quality';
import { ViewQfdPage } from './pages/view-qfd';
import { ReportsA3Page } from './pages/reports-a3';
import { CreateReportPage } from './pages/create-report';
import { ViewReportPage } from './pages/view-report';
import { SharedReportPage } from './pages/shared-report';
import { VsmPage } from './pages/vsm';
import { CreateVsmPage } from './pages/create-vsm';
import { ViewVsmPage } from './pages/view-vsm';
import { HoshinListPage, HoshinFormPage, HoshinReportPage } from './pages/hoshin';
import { AiTestPage } from './pages/ai-test';
import { TestTemplatesPage } from './pages/test-templates';
import { TestHistoryPage } from './pages/test-history';
import { ProfilePage } from './pages/profile';
import { TutorialsPage } from './pages/tutorials';
import { AdminTutorialsPage } from './pages/admin-tutorials';
import { Button } from './components/ui/button';
import { Share2 } from 'lucide-react';
import { useState } from 'react';
import { Providers } from './app/providers';
import { AppLayout } from './app/layout/AppLayout';
import { useRouter } from './app/routing/useRouter';
import { AuthProvider, useAuth } from './app/providers/AuthProvider';
import { LoginForm } from './features/auth';
import type { Route } from './app/routing/useRouter';

function AppContent() {
  const { currentRoute, params, navigate } = useRouter();
  const { isLoading, isAuthenticated, login } = useAuth();
  const [triggerShare, setTriggerShare] = useState(0);

  // Показываем экран загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-lg font-medium">Kaizen Center</div>
          <div className="text-sm text-muted-foreground">Загрузка...</div>
        </div>
      </div>
    );
  }

  // Если не авторизован, показываем форму логина
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} isLoading={isLoading} />;
  }

  const getHeaderActions = () => {
    switch (currentRoute) {
      case 'reports-a3':
        return (
          <Button onClick={() => navigate('create-report')}>
            Создать отчет A3
          </Button>
        );
      case 'vsm':
        return (
          <Button onClick={() => navigate('create-vsm')}>
            Создать карту потока
          </Button>
        );
      case 'qfd-reports':
        return (
          <Button onClick={() => navigate('create-qfd')}>
            Создать QFD
          </Button>
        );
      case 'hoshin':
        return (
          <Button onClick={() => navigate('create-hoshin')}>
            Создать отчет
          </Button>
        );
      case 'view-report':
        return (
          <Button variant="outline" onClick={() => setTriggerShare(prev => prev + 1)}>
            <Share2 className="mr-2 size-4" />
            Поделиться
          </Button>
        );
      default:
        return null;
    }
  };

  const renderPage = () => {
    switch (currentRoute) {
      case 'reports-a3':
        return <ReportsA3Page 
          onCreateReport={() => navigate('create-report')}
          onViewReport={(id) => navigate('view-report', { id })}
        />;
      case 'create-report':
        return <CreateReportPage onBack={() => navigate('reports-a3')} />;
      case 'view-report':
        return <ViewReportPage 
          reportId={params?.id || ''} 
          onBack={() => navigate('reports-a3')}
          shareTriggered={triggerShare}
        />;
      case 'shared-report':
        return <SharedReportPage reportId={params?.id || ''} />;
      case 'vsm':
        return <VsmPage 
          onCreateNew={() => navigate('create-vsm')}
          onViewMap={(id) => navigate('view-vsm', { id })}
        />;
      case 'create-vsm':
        return <CreateVsmPage 
          onBack={() => navigate('vsm')}
          onSuccess={(id) => navigate('view-vsm', { id })}
        />;
      case 'view-vsm':
        return <ViewVsmPage 
          mapId={params?.id || ''}
          onBack={() => navigate('vsm')}
        />;
      case 'qfd-reports':
        return <QfdReportsPage 
          onCreateReport={() => navigate('create-qfd')}
          onViewReport={(id) => navigate('view-qfd', { id })}
        />;
      case 'create-qfd':
        return <HouseOfQualityPage 
          onBack={() => navigate('qfd-reports')}
          onSuccess={(id) => navigate('view-qfd', { id })}
        />;
      case 'view-qfd':
        return <ViewQfdPage 
          reportId={params?.id || ''}
          onBack={() => navigate('qfd-reports')}
        />;
      case 'hoshin':
        return <HoshinListPage 
          onCreateNew={() => navigate('create-hoshin')}
          onViewReport={(id) => navigate('view-hoshin', { id })}
        />;
      case 'create-hoshin':
        return <HoshinFormPage 
          onNavigateToReport={(id) => navigate('view-hoshin', { id })}
          onNavigateBack={() => navigate('hoshin')}
        />;
      case 'view-hoshin':
        return <HoshinReportPage 
          reportId={params?.id || ''}
          onBack={() => navigate('hoshin')}
        />;
      case 'ai-test':
        return <AiTestPage />;
      case 'test-templates':
        return <TestTemplatesPage 
          onSelectTemplate={(template) => navigate(template.route as Route)}
          onCreateCustom={() => navigate('ai-test')}
        />;
      case 'test-history':
        return <TestHistoryPage navigate={navigate} />;
      case 'profile':
        return <ProfilePage />;
      case 'tutorials':
        return <TutorialsPage />;
      case 'admin-tutorials':
        return <AdminTutorialsPage />;
      default:
        return <TestTemplatesPage 
          onSelectTemplate={(template) => navigate(template.route as Route)}
          onCreateCustom={() => navigate('ai-test')}
        />;
    }
  };

  // Если это shared-report, рендерим без layout
  if (currentRoute === 'shared-report') {
    return (
      <Providers>
        {renderPage()}
      </Providers>
    );
  }

  return (
    <Providers>
      <AppLayout 
        currentRoute={currentRoute} 
        onNavigate={navigate}
        headerActions={getHeaderActions()}
      >
        {renderPage()}
      </AppLayout>
    </Providers>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
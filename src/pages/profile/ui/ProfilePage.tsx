import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { ProfileCard } from '../../../widgets/profile-card';
import { useAuth } from '../../../app/providers/AuthProvider';

interface ProfilePageProps {
  navigate?: (route: string) => void;
}

export function ProfilePage({ navigate }: ProfilePageProps) {
  const { user, isLoading } = useAuth();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1>Профиль</h1>
        <p className="text-muted-foreground">
          Персональные настройки и информация
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">
          Загрузка данных профиля...
        </div>
      ) : user ? (
        <ProfileCard user={user} />
      ) : (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Приложение открыто вне Telegram. Для получения данных профиля откройте приложение через Telegram Mini App.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
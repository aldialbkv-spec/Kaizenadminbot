import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { User as UserIcon, AtSign, Globe, Crown, Shield } from 'lucide-react';
import type { AuthUser } from '../../../features/auth';

interface ProfileCardProps {
  user: AuthUser;
}

export function ProfileCard({ user }: ProfileCardProps) {
  // Генерируем инициалы для fallback аватара
  const getInitials = () => {
    const firstInitial = user.firstName?.[0] || user.email?.[0] || '';
    const lastInitial = '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || '?';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Информация о профиле</CardTitle>
          {user.role === 'admin' && (
            <Badge variant="default" className="gap-1">
              <Shield className="size-3" />
              Администратор
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Аватар и основная информация */}
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={user.photoUrl} alt={user.firstName || user.email} />
            <AvatarFallback className="text-2xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">
                {user.firstName || user.email}
              </h3>
              {user.type === 'telegram' && (user as any).isPremium && (
                <Crown className="size-5 text-yellow-500" />
              )}
            </div>
            {user.username && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AtSign className="size-4" />
                <span className="text-sm">@{user.username}</span>
              </div>
            )}
            {user.email && !user.firstName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">{user.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserIcon className="size-4" />
              <span>ID пользователя</span>
            </div>
            <Badge variant="outline">{String(user.id).substring(0, 12)}</Badge>
          </div>
          
          {user.type === 'telegram' && (user as any).languageCode && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="size-4" />
                <span>Язык</span>
              </div>
              <Badge variant="outline">{(user as any).languageCode.toUpperCase()}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
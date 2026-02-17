import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import type { CustomerRequirement } from '../../../entities/qfd-report';
import { MAX_REQUIREMENTS } from '../../../entities/qfd-report';

interface RequirementsEditorProps {
  requirements: CustomerRequirement[];
  onChange: (requirements: CustomerRequirement[]) => void;
}

export function RequirementsEditor({ requirements, onChange }: RequirementsEditorProps) {
  const [newRequirement, setNewRequirement] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = () => {
    if (newRequirement.trim() && newCategory.trim() && requirements.length < MAX_REQUIREMENTS) {
      const newReq: CustomerRequirement = {
        id: `req${Date.now()}`,
        text: newRequirement.trim(),
        category: newCategory.trim(),
      };
      onChange([...requirements, newReq]);
      setNewRequirement('');
      setNewCategory('');
    }
  };

  const handleRemove = (id: string) => {
    onChange(requirements.filter((req) => req.id !== id));
  };

  const canAdd = requirements.length < MAX_REQUIREMENTS;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Что хочет клиент (Customer Requirements)</CardTitle>
        <CardDescription>
          Требования и ожидания клиентов. Вы можете добавлять или удалять пункты. Максимум {MAX_REQUIREMENTS} пунктов.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список требований */}
        <div className="space-y-2">
          {requirements.map((req, index) => (
            <div key={req.id} className="flex items-start gap-2 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  <Badge variant="secondary">{req.category}</Badge>
                </div>
                <p>{req.text}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(req.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Форма добавления */}
        {canAdd && (
          <div className="space-y-2 pt-4 border-t">
            <Input
              placeholder="Категория (например: Функциональность, Удобство)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Input
              placeholder="Требование клиента"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newRequirement.trim() && newCategory.trim()) {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Button
              onClick={handleAdd}
              disabled={!newRequirement.trim() || !newCategory.trim()}
              className="w-full"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить требование
            </Button>
          </div>
        )}

        {!canAdd && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Достигнут максимум в {MAX_REQUIREMENTS} пунктов
          </p>
        )}
      </CardContent>
    </Card>
  );
}

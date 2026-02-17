import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import type { TechnicalCharacteristic } from '../../../entities/qfd-report';
import { MAX_CHARACTERISTICS } from '../../../entities/qfd-report';

interface CharacteristicsEditorProps {
  characteristics: TechnicalCharacteristic[];
  onChange: (characteristics: TechnicalCharacteristic[]) => void;
}

export function CharacteristicsEditor({ characteristics, onChange }: CharacteristicsEditorProps) {
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newDirection, setNewDirection] = useState<'↑' | '↓' | '○'>('↑');

  const handleAdd = () => {
    if (newText.trim() && newCategory.trim() && newUnit.trim() && characteristics.length < MAX_CHARACTERISTICS) {
      const newChar: TechnicalCharacteristic = {
        id: `tech${Date.now()}`,
        text: newText.trim(),
        category: newCategory.trim(),
        unit: newUnit.trim(),
        direction: newDirection,
      };
      onChange([...characteristics, newChar]);
      setNewText('');
      setNewCategory('');
      setNewUnit('');
      setNewDirection('↑');
    }
  };

  const handleRemove = (id: string) => {
    onChange(characteristics.filter((char) => char.id !== id));
  };

  const canAdd = characteristics.length < MAX_CHARACTERISTICS;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Что мы можем дать (Technical Characteristics)</CardTitle>
        <CardDescription>
          Измеримые технические параметры, которые компания может контролировать. Максимум {MAX_CHARACTERISTICS} пунктов.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список характеристик */}
        <div className="space-y-2">
          {characteristics.map((char, index) => (
            <div key={char.id} className="flex items-start gap-2 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  <Badge variant="secondary">{char.category}</Badge>
                  <Badge variant="outline">{char.direction}</Badge>
                </div>
                <p>{char.text}</p>
                <p className="text-sm text-muted-foreground mt-1">Единица измерения: {char.unit}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(char.id)}
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
              placeholder="Категория (например: Производительность, Функциональность)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Input
              placeholder="Техническая характеристика"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Единица измерения (например: мс, %, шт)"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
              />
              <Select value={newDirection} onValueChange={(value: '↑' | '↓' | '○') => setNewDirection(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="↑">↑ Больше лучше</SelectItem>
                  <SelectItem value="↓">↓ Меньше лучше</SelectItem>
                  <SelectItem value="○">○ Оптимум</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAdd}
              disabled={!newText.trim() || !newCategory.trim() || !newUnit.trim()}
              className="w-full"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить характеристику
            </Button>
          </div>
        )}

        {!canAdd && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Достигнут максимум в {MAX_CHARACTERISTICS} пунктов
          </p>
        )}
      </CardContent>
    </Card>
  );
}

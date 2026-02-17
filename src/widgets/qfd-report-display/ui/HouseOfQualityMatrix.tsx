import { Badge } from '../../../components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type {
  CustomerRequirement,
  TechnicalCharacteristic,
  RelationshipMatrix as Matrix,
  RelationshipStrength,
} from '../../../entities/qfd-report';

interface HouseOfQualityMatrixProps {
  requirements: CustomerRequirement[];
  characteristics: TechnicalCharacteristic[];
  matrix: Matrix;
}

export function HouseOfQualityMatrix({
  requirements,
  characteristics,
  matrix,
}: HouseOfQualityMatrixProps) {
  const getRelationship = (reqId: string, charId: string): RelationshipStrength => {
    return (matrix[`${reqId}_${charId}`] || '') as RelationshipStrength;
  };

  // Сортируем требования по важности (10 = самое важное, 1 = самое неважное)
  const sortedRequirements = [...requirements].sort((a, b) => {
    const importanceA = a.importance || 0;
    const importanceB = b.importance || 0;
    return importanceB - importanceA;
  });

  // Сортируем технические характеристики по рангу важности (1 = самое важное)
  const sortedCharacteristics = [...characteristics].sort((a, b) => {
    const rankA = a.rank || 999;
    const rankB = b.rank || 999;
    return rankA - rankB;
  });

  // Функция для определения цвета фона ячейки
  const getCellColor = (strength: RelationshipStrength): string => {
    switch (strength) {
      case '9':
        return 'bg-teal-500/80';
      case '3':
        return 'bg-teal-400/60';
      case '1':
        return 'bg-teal-300/40';
      default:
        return 'bg-background';
    }
  };

  // Функция для цвета текста символа
  const getSymbolColor = (strength: RelationshipStrength): string => {
    switch (strength) {
      case '9':
        return 'text-teal-950';
      case '3':
        return 'text-teal-900';
      case '1':
        return 'text-teal-800';
      default:
        return 'text-muted-foreground';
    }
  };

  // Подготовка данных для Pie Chart
  const pieChartData = sortedCharacteristics
    .filter((char) => char.relativeWeight && char.relativeWeight > 0)
    .map((char) => ({
      name: char.text,
      value: char.relativeWeight || 0,
      absoluteWeight: char.absoluteWeight || 0,
      rank: char.rank || 0,
    }));

  // Цвета для диаграммы - градиент от самого важного к менее важному
  const COLORS = [
    '#0ea5e9', // sky-500 - самый важный
    '#06b6d4', // cyan-500
    '#14b8a6', // teal-500
    '#10b981', // emerald-500
    '#84cc16', // lime-500
    '#eab308', // yellow-500
    '#f59e0b', // amber-500
    '#f97316', // orange-500
    '#ef4444', // red-500
    '#ec4899', // pink-500
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <div className="border rounded-lg">
          <table className="w-full border-collapse">
          {/* Заголовок с техническими характеристиками */}
          <thead>
            <tr>
              <th className="border p-3 bg-muted min-w-[280px] text-left align-top">
                <div className="font-medium">Требования клиентов</div>
                <div className="text-xs text-muted-foreground mt-1">
                  (от важного к менее важному)
                </div>
              </th>
              <th className="border p-2 bg-muted text-center w-16 align-top">
                <div className="text-xs font-medium">Важность</div>
              </th>
              {sortedCharacteristics.map((char) => (
                <th key={char.id} className="border p-2 bg-muted text-center min-w-[90px] max-w-[110px] align-top">
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xs font-medium leading-tight break-words">{char.text}</div>
                    <div className="text-xs text-muted-foreground">({char.unit})</div>
                    <div className="text-lg">{char.direction}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Тело таблицы с требованиями и матрицей */}
          <tbody>
            {sortedRequirements.map((req) => (
              <tr key={req.id}>
                {/* Требование клиента */}
                <td className="border p-3 bg-background align-top">
                  <span className="text-sm">{req.text}</span>
                </td>

                {/* Важность */}
                <td className="border p-2 text-center bg-amber-50/50 align-middle">
                  <span className="text-sm font-bold text-amber-700">
                    {req.importance || '-'}
                  </span>
                </td>

                {/* Ячейки матрицы взаимосвязей */}
                {sortedCharacteristics.map((char) => {
                  const strength = getRelationship(req.id, char.id);
                  return (
                    <td
                      key={char.id}
                      className={`border p-2 text-center align-middle transition-colors ${getCellColor(strength)}`}
                    >
                      <span className={`text-2xl font-bold ${getSymbolColor(strength)}`}>
                        {strength}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Разделитель */}
            <tr>
              <td className="border-t-4 border-primary/20 p-0"></td>
              <td className="border-t-4 border-primary/20 p-0"></td>
              {sortedCharacteristics.map((char) => (
                <td key={char.id} className="border-t-4 border-primary/20 p-0"></td>
              ))}
            </tr>

            {/* Абсолютный вес */}
            <tr className="bg-blue-50/50">
              <td className="border p-3 bg-muted align-middle">
                <span className="text-sm font-medium">Абсолютный вес</span>
              </td>
              <td className="border bg-blue-50/50"></td>
              {sortedCharacteristics.map((char) => (
                <td key={char.id} className="border p-2 text-center align-middle">
                  <span className="text-sm font-semibold">{char.absoluteWeight || '-'}</span>
                </td>
              ))}
            </tr>

            {/* Относительный вес */}
            <tr className="bg-blue-50/50">
              <td className="border p-3 bg-muted align-middle">
                <span className="text-sm font-medium">Относительный вес (%)</span>
              </td>
              <td className="border bg-blue-50/50"></td>
              {sortedCharacteristics.map((char) => (
                <td key={char.id} className="border p-2 text-center align-middle">
                  <span className="text-sm font-medium">
                    {char.relativeWeight ? `${char.relativeWeight}%` : '-'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Ранг важности */}
            <tr className="bg-blue-100/70">
              <td className="border p-3 bg-muted align-middle">
                <span className="text-sm font-medium">Ранг важности</span>
              </td>
              <td className="border bg-blue-100/70"></td>
              {sortedCharacteristics.map((char) => (
                <td key={char.id} className="border p-2 text-center align-middle">
                  <Badge variant={char.rank && char.rank <= 3 ? 'default' : 'secondary'}>
                    {char.rank || '-'}
                  </Badge>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

          {/* Легенда значений */}
          <div className="p-3 bg-muted/30 border-t flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl text-teal-950 font-bold">9</span>
              <span className="text-muted-foreground">Сильная связь</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl text-teal-900 font-bold">3</span>
              <span className="text-muted-foreground">Средняя связь</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl text-teal-800 font-bold">1</span>
              <span className="text-muted-foreground">Слабая связь</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart - Распределение важности технических характеристик */}
      {pieChartData.length > 0 && (
        <div className="border rounded-lg p-6 bg-card">
          <h4 className="font-medium mb-4 text-center">
            Распределение важности технических характеристик
          </h4>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-1">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Относительный вес: {data.value.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Абсолютный вес: {data.absoluteWeight}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

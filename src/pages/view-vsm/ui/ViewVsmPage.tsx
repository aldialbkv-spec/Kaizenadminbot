import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { getVsmById } from '../../../entities/vsm';
import type { ValueStreamMap, SpaghettiDiagram as SpaghettiDiagramType } from '../../../entities/vsm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '../../../components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { SpaghettiDiagram } from '../../../widgets/spaghetti-diagram';

interface ViewVsmPageProps {
  mapId: string;
  onBack?: () => void;
}

export function ViewVsmPage({ mapId, onBack }: ViewVsmPageProps) {
  const [map, setMap] = useState<ValueStreamMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mapId) {
      loadMap(mapId);
    }
  }, [mapId]);

  const loadMap = async (id: string) => {
    try {
      setLoading(true);
      const data = await getVsmById(id);
      setMap(data);
    } catch (error) {
      console.error('Ошибка загрузки карты потока:', error);
      alert('Не удалось загрузить карту потока');
      onBack?.();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!map) {
    return null;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="mb-2">{map.title}</h1>
        <p className="text-sm text-muted-foreground">
          Создано: {new Date(map.createdAt).toLocaleDateString('ru-RU')}
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4">Исходные данные</h2>
        <div className="space-y-4">
          {map.input.companyName && (
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Название компании:</p>
              <p>{map.input.companyName}</p>
            </div>
          )}
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Чем занимается компания:</p>
            <p>{map.input.companyActivity}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Процесс для улучшения:</p>
            <p>{map.input.processToImprove}</p>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="space-y-6">
        <OutputSection title="1. КПСЦ текущего состояния (As Is)" content={map.output.asIsMap} />
        <OutputSection title="2. Диаграмма загрузки операторов" content={map.output.operatorLoad} />
        <OutputSection title="3. Диаграмма спагетти" content={map.output.spaghettiDiagram} />
        <OutputSection title="4. Таблица проблем (7 видов потерь)" content={map.output.wasteTable} />
        <OutputSection title="5. Мероприятия Just in Time" content={map.output.jitMeasures} />
        <OutputSection title="6. КПСЦ будущего состояния (To Be)" content={map.output.toBeMap} />
      </div>
    </div>
  );
}

function OutputSection({ title, content }: { title: string; content: string | any }) {
  const [activeTab, setActiveTab] = useState<string>('table');
  
  const renderChart = (chartData: any[]) => {
    const data = chartData
      .filter((row: any) => row.stage !== 'ИТОГО')
      .map((row: any) => ({
        name: row.stage,
        operationTime: parseInt(row.operationTime) || 0,
        waitTime: parseInt(row.waitTime) || 0,
      }));
    
    const chartConfig = {
      operationTime: {
        label: 'Время операции',
        color: 'hsl(142, 71%, 45%)',
      },
      waitTime: {
        label: 'Время ожидания',
        color: 'hsl(0, 84%, 60%)',
      },
    };
    
    console.log('📊 Chart Data:', data);
    console.log('📊 Chart Config:', chartConfig);
    console.log('📊 Original chartData:', chartData);
    
    return (
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid horizontal={false} />
          <YAxis 
            dataKey="name" 
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            width={180}
          />
          <XAxis type="number" />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="operationTime" 
            name="Время операции"
            stackId="a"
            fill="hsl(142, 71%, 45%)"
            radius={[0, 4, 4, 0]} 
          />
          <Bar 
            dataKey="waitTime" 
            name="Время ожидания"
            stackId="a"
            fill="hsl(0, 84%, 60%)"
            radius={[0, 4, 4, 0]} 
          />
        </BarChart>
      </ChartContainer>
    );
  };
  
  const renderTable = (tableData: any[]) => {
    const regularRows = tableData.filter((row: any) => row.stage !== 'ИТОГО');
    
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-normal">Этап</TableHead>
              <TableHead className="whitespace-normal">Описание процесса</TableHead>
              <TableHead className="whitespace-normal min-w-[100px]">Время операции (мин)</TableHead>
              <TableHead className="whitespace-normal min-w-[100px]">Время ожидания (мин)</TableHead>
              <TableHead className="whitespace-normal">Ответственный</TableHead>
              <TableHead className="whitespace-normal">Проблемы</TableHead>
              <TableHead className="whitespace-normal">Добавляет ценность</TableHead>
              <TableHead className="whitespace-normal">Потери</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regularRows.map((row: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="whitespace-normal break-words">{row.stage}</TableCell>
                <TableCell className="whitespace-normal break-words max-w-[300px]">{row.description}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.operationTime}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.waitTime}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.responsible}</TableCell>
                <TableCell className="whitespace-normal break-words max-w-[300px]">{row.problems}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.addsValue || '—'}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.hasWaste || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  const renderOperatorLoadTable = (data: any[]) => {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-normal">Оператор</TableHead>
              <TableHead className="whitespace-normal min-w-[150px]">Полезная загрузка (мин)</TableHead>
              <TableHead className="whitespace-normal min-w-[120px]">Потери (мин)</TableHead>
              <TableHead className="whitespace-normal">Комментарий</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="whitespace-normal break-words">{row.operator}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.usefulLoad}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.waste}</TableCell>
                <TableCell className="whitespace-normal break-words max-w-[400px]">{row.comment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  const renderOperatorLoadChart = (data: any[]) => {
    const chartData = data.map((row: any) => ({
      name: row.operator,
      usefulLoad: row.usefulLoad || 0,
      waste: row.waste || 0,
    }));
    
    const chartConfig = {
      usefulLoad: {
        label: 'Полезная загрузка (мин)',
        color: 'hsl(142, 71%, 45%)',
      },
      waste: {
        label: 'Потери (мин)',
        color: 'hsl(0, 84%, 60%)',
      },
    };
    
    return (
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid horizontal={false} />
          <YAxis 
            dataKey="name" 
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            width={180}
          />
          <XAxis type="number" />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="usefulLoad" 
            name="Полезная загрузка (мин)"
            stackId="a"
            fill="hsl(142, 71%, 45%)"
            radius={[0, 4, 4, 0]} 
          />
          <Bar 
            dataKey="waste" 
            name="Потери (мин)"
            stackId="a"
            fill="hsl(0, 84%, 60%)"
            radius={[0, 4, 4, 0]} 
          />
        </BarChart>
      </ChartContainer>
    );
  };
  
  const renderJitMeasuresTable = (data: any[]) => {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-normal min-w-[200px]">Принцип потока</TableHead>
              <TableHead className="whitespace-normal min-w-[250px]">Действие</TableHead>
              <TableHead className="whitespace-normal">Срок</TableHead>
              <TableHead className="whitespace-normal">Ответственный</TableHead>
              <TableHead className="whitespace-normal min-w-[200px]">Ожидаемый результат</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: any, index: number) => (
              <TableRow key={index}>
                <TableCell className="whitespace-normal break-words">{row.principle}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.action}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.deadline}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.responsible}</TableCell>
                <TableCell className="whitespace-normal break-words">{row.expectedResult}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderContent = () => {
    if (title.includes('1. КПСЦ текущего состояния')) {
      let chartData = content;
      
      if (typeof content === 'string') {
        try {
          chartData = JSON.parse(content);
        } catch {
          chartData = [];
        }
      }
      
      if (Array.isArray(chartData) && chartData.length > 0 && chartData[0].stage) {
        const totalRow = chartData.find((row: any) => row.stage === 'ИТОГО');
        
        return (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="table">Таблица</TabsTrigger>
                <TabsTrigger value="chart">График</TabsTrigger>
              </TabsList>
              <TabsContent value="table" className="mt-4">
                {renderTable(chartData)}
              </TabsContent>
              <TabsContent value="chart" className="mt-4">
                {renderChart(chartData)}
              </TabsContent>
            </Tabs>
            
            {totalRow && (
              <div className="mt-6 pt-4 border-t">
                <p>
                  <strong>ИТОГО:</strong> Время операции — {totalRow.operationTime} мин, Время ожидания — {totalRow.waitTime} мин
                </p>
              </div>
            )}
          </div>
        );
      }
    }
    
    if (title.includes('2. Диаграмма загрузки операторов')) {
      let operatorData = content;
      
      if (typeof content === 'string') {
        try {
          operatorData = JSON.parse(content);
        } catch {
          operatorData = [];
        }
      }
      
      if (Array.isArray(operatorData) && operatorData.length > 0 && operatorData[0].operator) {
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="table">Таблица</TabsTrigger>
              <TabsTrigger value="chart">График</TabsTrigger>
            </TabsList>
            <TabsContent value="table" className="mt-4">
              {renderOperatorLoadTable(operatorData)}
            </TabsContent>
            <TabsContent value="chart" className="mt-4">
              {renderOperatorLoadChart(operatorData)}
            </TabsContent>
          </Tabs>
        );
      }
    }
    
    if (title.includes('5. Мероприятия Just in Time')) {
      let jitData = content;
      
      if (typeof content === 'string') {
        try {
          jitData = JSON.parse(content);
        } catch {
          jitData = null;
        }
      }
      
      if (Array.isArray(jitData) && jitData.length > 0 && jitData[0].principle) {
        return renderJitMeasuresTable(jitData);
      }
    }
    
    if (title.includes('3. Диаграмма спагетти')) {
      let spaghettiData: SpaghettiDiagramType | null = null;
      
      if (typeof content === 'string') {
        try {
          spaghettiData = JSON.parse(content);
        } catch {
          spaghettiData = null;
        }
      } else {
        spaghettiData = content;
      }
      
      if (spaghettiData && spaghettiData.zones && spaghettiData.routes) {
        return (
          <div className="space-y-4">
            <SpaghettiDiagram 
              zones={spaghettiData.zones} 
              routes={spaghettiData.routes} 
            />
            {spaghettiData.summary && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Анализ:</h4>
                <p className="text-sm whitespace-pre-wrap">{spaghettiData.summary}</p>
              </div>
            )}
            
            {/* Таблица маршрутов */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Детализация маршрутов:</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Откуда</TableHead>
                    <TableHead>Куда</TableHead>
                    <TableHead>Расстояние</TableHead>
                    <TableHead>Частота</TableHead>
                    <TableHead>Тип потерь</TableHead>
                    <TableHead>Описание</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spaghettiData.routes.map((route, index) => {
                    const fromZone = spaghettiData.zones.find(z => z.id === route.from);
                    const toZone = spaghettiData.zones.find(z => z.id === route.to);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="whitespace-normal">{fromZone?.name || route.from}</TableCell>
                        <TableCell className="whitespace-normal">{toZone?.name || route.to}</TableCell>
                        <TableCell>{route.distance}</TableCell>
                        <TableCell>{route.frequency}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            route.wasteType === 'transport' ? 'bg-red-100 text-red-800' :
                            route.wasteType === 'motion' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {route.wasteType === 'transport' ? 'Транспортировка' :
                             route.wasteType === 'motion' ? 'Лишние движения' : 'Ожидание'}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-normal max-w-[300px]">{route.description}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      }
    }
    
    if (Array.isArray(content) && content.length > 0 && content[0].stage) {
      return renderTable(content);
    }

    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].stage) {
        return renderTable(parsed);
      }
      
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <pre className="overflow-x-auto rounded-md bg-muted p-4">
            <code>{JSON.stringify(parsed, null, 2)}</code>
          </pre>
        );
      }
    } catch {
      // Если не JSON, рендерим как обычный текст
    }
    
    // Обработка текста с переносами строк
    const textContent = typeof content === 'string' ? content : String(content);
    const lines = textContent.split('\\n').filter(line => line.trim().length > 0);
    
    return (
      <div className="prose prose-sm max-w-none space-y-2">
        {lines.map((line, index) => (
          <p key={index} className="m-0">{line}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4">{title}</h2>
      {renderContent()}
    </div>
  );
}
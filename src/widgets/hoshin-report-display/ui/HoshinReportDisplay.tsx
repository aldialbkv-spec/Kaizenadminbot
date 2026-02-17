import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import type { HoshinReport } from '../../../entities/hoshin-report';

interface HoshinReportDisplayProps {
  report: HoshinReport;
}

export function HoshinReportDisplay({ report }: HoshinReportDisplayProps) {
  const { input, output } = report;

  return (
    <div className="space-y-6">
      {/* Заголовок отчета */}
      <Card>
        <CardHeader>
          <CardTitle>{report.title}</CardTitle>
          <CardDescription>
            Создано: {new Date(report.createdAt).toLocaleDateString('ru-RU')}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Исходные данные */}
      <Card>
        <CardHeader>
          <CardTitle>Исходные данные</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Миссия компании</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{input.mission}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Видение компании</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{input.vision}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Ценности компании</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{input.values}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Цели на год</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{input.goals}</p>
          </div>
        </CardContent>
      </Card>

      {/* Стратегия */}
      {output && (
        <Card>
          <CardHeader>
            <CardTitle>Стратегия развертывания (Hoshin Kanri)</CardTitle>
            {output.analysis && (
              <CardDescription className="mt-2">
                {output.analysis}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px] max-w-[300px] break-words whitespace-normal">Тактическая задача</TableHead>
                    <TableHead className="min-w-[100px] break-words whitespace-normal">Срок</TableHead>
                    <TableHead className="min-w-[120px] break-words whitespace-normal">Ответственный</TableHead>
                    <TableHead className="min-w-[200px] max-w-[300px] break-words whitespace-normal">Ожидаемый результат</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {output.tasks && output.tasks.length > 0 ? (
                    (() => {
                      // Группируем задачи по целям
                      const groupedTasks = output.tasks.reduce((acc, task) => {
                        if (!acc[task.goalName]) {
                          acc[task.goalName] = [];
                        }
                        acc[task.goalName].push(task);
                        return acc;
                      }, {} as Record<string, typeof output.tasks>);

                      return Object.entries(groupedTasks).map(([goalName, tasks], groupIndex) => (
                        <>
                          {/* Строка с названием годовой цели */}
                          <TableRow key={`goal-${groupIndex}`} className="bg-muted/50">
                            <TableCell colSpan={4} className="font-medium">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Цель:</span>
                                <span>{goalName}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                          {/* Строки с тактическими задачами для этой цели */}
                          {tasks.map((task, taskIndex) => (
                            <TableRow key={`task-${groupIndex}-${taskIndex}`}>
                              <TableCell className="whitespace-normal break-words max-w-[300px]">{task.tacticalTask}</TableCell>
                              <TableCell className="whitespace-normal break-words">{task.deadline}</TableCell>
                              <TableCell className="whitespace-normal break-words">{task.responsible}</TableCell>
                              <TableCell className="whitespace-normal break-words max-w-[300px]">{task.expectedResult}</TableCell>
                            </TableRow>
                          ))}
                        </>
                      ));
                    })()
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Нет тактических задач
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import type { QFDReport } from '../../../entities/qfd-report';
import { HouseOfQualityMatrix } from './HouseOfQualityMatrix';
import { Separator } from '../../../components/ui/separator';

interface QfdReportDisplayProps {
  report: QFDReport;
}

export function QfdReportDisplay({ report }: QfdReportDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Заголовок отчета */}
      <Card>
        <CardHeader>
          <CardTitle>QFD Отчет: {report.product}</CardTitle>
          <CardDescription>{report.companyDescription}</CardDescription>
        </CardHeader>
      </Card>

      {/* Дом качества - Интегрированная матрица */}
      <Card>
        <CardHeader>
          <CardTitle>Дом качества (House of Quality)</CardTitle>
          <CardDescription>
            Интегрированная матрица: требования клиентов, взаимосвязи и рейтинг характеристик
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HouseOfQualityMatrix
            requirements={report.customerRequirements}
            characteristics={report.technicalCharacteristics}
            matrix={report.relationshipMatrix}
          />
        </CardContent>
      </Card>

      {/* 4. Корреляционная матрица */}
      {report.correlations && report.correlations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Корреляции между техническими характеристиками</CardTitle>
            <CardDescription>Взаимное влияние характеристик друг на друга</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Матрица корреляций */}
            <div className="mb-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Характеристика</TableHead>
                    {report.technicalCharacteristics.map((char) => (
                      <TableHead key={char.id} className="text-center min-w-[100px] max-w-[150px] whitespace-normal">
                        <div className="break-words hyphens-auto">{char.text}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.technicalCharacteristics.map((rowChar) => {
                    const getCorrelation = (char1Id: string, char2Id: string) => {
                      return report.correlations.find(
                        (corr) =>
                          (corr.characteristic1Id === char1Id && corr.characteristic2Id === char2Id) ||
                          (corr.characteristic1Id === char2Id && corr.characteristic2Id === char1Id)
                      );
                    };

                    const getCellStyle = (type: string) => {
                      switch (type) {
                        case '++':
                          return 'bg-green-600/20 text-green-700 dark:text-green-400';
                        case '+':
                          return 'bg-green-400/20 text-green-600 dark:text-green-500';
                        case '-':
                          return 'bg-orange-400/20 text-orange-600 dark:text-orange-500';
                        case '--':
                          return 'bg-red-600/20 text-red-700 dark:text-red-400';
                        default:
                          return '';
                      }
                    };

                    return (
                      <TableRow key={rowChar.id}>
                        <TableCell className="bg-muted/50">{rowChar.text}</TableCell>
                        {report.technicalCharacteristics.map((colChar) => {
                          if (rowChar.id === colChar.id) {
                            return (
                              <TableCell key={colChar.id} className="bg-muted/30 text-center text-muted-foreground">
                                —
                              </TableCell>
                            );
                          }

                          const correlation = getCorrelation(rowChar.id, colChar.id);
                          
                          return (
                            <TableCell
                              key={colChar.id}
                              className={`text-center ${correlation ? getCellStyle(correlation.type) : ''}`}
                            >
                              {correlation ? correlation.type : ''}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Легенда */}
              <div className="flex gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-green-600/20 border rounded flex items-center justify-center text-green-700">++</div>
                  <span className="text-muted-foreground">Сильная положительная</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-green-400/20 border rounded flex items-center justify-center text-green-600">+</div>
                  <span className="text-muted-foreground">Положительная</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-orange-400/20 border rounded flex items-center justify-center text-orange-600">-</div>
                  <span className="text-muted-foreground">Отрицательная</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-red-600/20 border rounded flex items-center justify-center text-red-700">--</div>
                  <span className="text-muted-foreground">Сильная отрицательная</span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Детальное описание корреляций */}
            <div>
              <h4 className="font-medium mb-4">Детальное описание коррел��ций:</h4>
              <div className="space-y-6">
                {/* Группируем корреляции по типам */}
                {(() => {
                  const groupedCorrelations = {
                    '++': { 
                      title: 'Сильная положительная корреляция', 
                      items: [] as typeof report.correlations,
                      borderColor: 'border-green-600',
                      textColor: 'text-green-700 dark:text-green-400'
                    },
                    '+': { 
                      title: 'Положительная корреляция', 
                      items: [] as typeof report.correlations,
                      borderColor: 'border-green-400',
                      textColor: 'text-green-600 dark:text-green-500'
                    },
                    '-': { 
                      title: 'Отрицательная корреляция', 
                      items: [] as typeof report.correlations,
                      borderColor: 'border-orange-400',
                      textColor: 'text-orange-600 dark:text-orange-500'
                    },
                    '--': { 
                      title: 'Сильная отрицательная корреляция', 
                      items: [] as typeof report.correlations,
                      borderColor: 'border-red-600',
                      textColor: 'text-red-700 dark:text-red-400'
                    },
                  };

                  report.correlations.forEach((corr) => {
                    if (groupedCorrelations[corr.type as keyof typeof groupedCorrelations]) {
                      groupedCorrelations[corr.type as keyof typeof groupedCorrelations].items.push(corr);
                    }
                  });

                  return Object.entries(groupedCorrelations).map(([type, group]) => {
                    if (group.items.length === 0) return null;
                    
                    return (
                      <div key={type} className={`border-l-4 ${group.borderColor} pl-4 py-2`}>
                        <h4 className={`font-medium mb-3 ${group.textColor}`}>{group.title}:</h4>
                        <ul className="space-y-2 ml-2">
                          {group.items.map((corr, index) => {
                            const char1 = report.technicalCharacteristics.find((c) => c.id === corr.characteristic1Id);
                            const char2 = report.technicalCharacteristics.find((c) => c.id === corr.characteristic2Id);
                            
                            return (
                              <li key={index} className="text-sm">
                                <span className="font-medium">{char1?.text} ↔ {char2?.text}</span>
                                <p className="text-muted-foreground mt-1">{corr.description}</p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. План действий для топ-3 характеристик */}
      {report.actions && report.actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>План действий для приоритетных характеристик</CardTitle>
            <CardDescription>
              Конкретные задачи для улучшения топ-3 технических характеристик с наибольшим весом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 px-6">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[22%]">Действие</TableHead>
                    <TableHead className="w-[20%]">Требования клиентов</TableHead>
                    <TableHead className="w-[20%] break-words whitespace-normal">Техническая характеристика</TableHead>
                    <TableHead className="w-[12%] text-center">Влияние</TableHead>
                    <TableHead className="w-[13%]">Срок</TableHead>
                    <TableHead className="w-[13%]">Ответственный</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.actions.map((action) => {
                    const characteristic = report.technicalCharacteristics.find(
                      (c) => c.id === action.characteristicId
                    );
                    const requirements = report.customerRequirements.filter((req) =>
                      action.requirementIds.includes(req.id)
                    );

                    return (
                      <TableRow key={action.id}>
                        <TableCell className="align-top">
                          <div className="break-words whitespace-normal overflow-wrap-anywhere">{action.action}</div>
                        </TableCell>
                        <TableCell className="align-top">
                          <ul className="space-y-1">
                            {requirements.map((req) => (
                              <li key={req.id} className="text-sm break-words whitespace-normal overflow-wrap-anywhere">
                                • {req.text}
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-2">
                            <Badge variant="outline" className="text-xs">
                              {characteristic?.category}
                            </Badge>
                            <div className="text-sm break-words whitespace-normal overflow-wrap-anywhere">{characteristic?.text}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center align-top">
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {action.impact > 0 ? '+' : ''}{action.impact}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm align-top">
                          <div className="break-words whitespace-normal overflow-wrap-anywhere">{action.duration}</div>
                        </TableCell>
                        <TableCell className="text-sm align-top">
                          <div className="break-words whitespace-normal overflow-wrap-anywhere">{action.responsible}</div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Конкурентный анализ */}
      {report.competitorsEnabled && report.competitiveRatings && report.competitiveRatings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Конкурентный анализ</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Требование</TableHead>
                  <TableHead className="w-24">Мы</TableHead>
                  {report.competitors?.competitor1 && <TableHead className="w-24">{report.competitors.competitor1}</TableHead>}
                  {report.competitors?.competitor2 && <TableHead className="w-24">{report.competitors.competitor2}</TableHead>}
                  {report.competitors?.competitor3 && <TableHead className="w-24">{report.competitors.competitor3}</TableHead>}
                  <TableHead className="w-24">На сколько улучшать?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.competitiveRatings.map((rating) => {
                  const req = report.customerRequirements.find((r) => r.id === rating.requirementId);
                  return (
                    <TableRow key={rating.requirementId}>
                      <TableCell>{req?.text}</TableCell>
                      <TableCell>{rating.ourProduct}</TableCell>
                      {report.competitors?.competitor1 && <TableCell>{rating.competitor1 || '-'}</TableCell>}
                      {report.competitors?.competitor2 && <TableCell>{rating.competitor2 || '-'}</TableCell>}
                      {report.competitors?.competitor3 && <TableCell>{rating.competitor3 || '-'}</TableCell>}
                      <TableCell>
                        {rating.improvementNeeded !== null && rating.improvementNeeded !== undefined && rating.improvementNeeded > 0 ? (
                          <Badge variant={rating.improvementNeeded > 1 ? 'destructive' : 'default'}>
                            {rating.improvementNeeded}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {report.competitiveStrategy && (
              <div className="mt-6 space-y-4">
                <Separator />
                
                {report.competitiveStrategy.strengths.length > 0 && (
                  <div>
                    <h4 className="mb-2">Наши сильные стороны:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {report.competitiveStrategy.strengths.map((item, i) => (
                        <li key={i} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.competitiveStrategy.gaps.length > 0 && (
                  <div>
                    <h4 className="mb-2">Отставания:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {report.competitiveStrategy.gaps.map((item, i) => (
                        <li key={i} className="text-sm text-destructive">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.competitiveStrategy.opportunities.length > 0 && (
                  <div>
                    <h4 className="mb-2">Возможности для дифференциации:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {report.competitiveStrategy.opportunities.map((item, i) => (
                        <li key={i} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}


    </div>
  );
}
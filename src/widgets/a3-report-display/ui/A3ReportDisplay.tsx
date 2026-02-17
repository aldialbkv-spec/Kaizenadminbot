import type { A3Report } from '../../../entities/a3-report';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';

interface A3ReportDisplayProps {
  input: A3Report['input'];
  output: A3Report['output'];
}

export function A3ReportDisplay({ input, output }: A3ReportDisplayProps) {
  if (!output) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Исходные данные 5W1H */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4">Исходные данные (5W1H)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="mb-2">Что (What)</h4>
            <p className="text-muted-foreground">{input.what}</p>
          </div>
          <div>
            <h4 className="mb-2">Где (Where)</h4>
            <p className="text-muted-foreground">{input.where}</p>
          </div>
          <div>
            <h4 className="mb-2">Когда (When)</h4>
            <p className="text-muted-foreground">{input.when}</p>
          </div>
          <div>
            <h4 className="mb-2">Кто (Who)</h4>
            <p className="text-muted-foreground">{input.who}</p>
          </div>
          <div>
            <h4 className="mb-2">Почему (Why)</h4>
            <p className="text-muted-foreground">{input.why}</p>
          </div>
          <div>
            <h4 className="mb-2">Как (How)</h4>
            <p className="text-muted-foreground">{input.how}</p>
          </div>
        </div>
      </div>

      {/* Сгенерированный A3 отчет */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-6">Сгенерированный A3 отчет</h2>

        {/* Текущее и Целевое состояния - в две колонки */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Текущее состояние */}
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <h3 className="mb-2">Текущее состояние</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{output.currentState}</p>
          </div>

          {/* Целевое состояние */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="mb-2">Целевое состояние</h3>
            <p className="text-muted-foreground">{output.targetCondition}</p>
          </div>
        </div>

        {/* Остальное - в одну колонку */}
        <div className="space-y-8">
          {/* Анализ причин */}
          <div>
            <h3 className="mb-4">Анализ коренных причин</h3>
            
            {/* Диаграмма Исикавы */}
            <div className="mb-6">
              <h4 className="mb-3">Диаграмма Исикавы</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Man */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2">👤 Человек (Man)</h4>
                  {output.rootCauseAnalysis.ishikawa.man.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {output.rootCauseAnalysis.ishikawa.man.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">Причин не выявлено</p>
                  )}
                </div>

                {/* Machine */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2">⚙️ Оборудование (Machine)</h4>
                  {output.rootCauseAnalysis.ishikawa.machine.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {output.rootCauseAnalysis.ishikawa.machine.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">Причин не выявлено</p>
                  )}
                </div>

                {/* Method */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2">📋 Метод (Method)</h4>
                  {output.rootCauseAnalysis.ishikawa.method.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {output.rootCauseAnalysis.ishikawa.method.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">Причин не выявлено</p>
                  )}
                </div>

                {/* Material */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2">📦 Материал (Material)</h4>
                  {output.rootCauseAnalysis.ishikawa.material.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {output.rootCauseAnalysis.ishikawa.material.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">Причин не выявлено</p>
                  )}
                </div>

                {/* Measurement */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2">📊 Измерение (Measurement)</h4>
                  {output.rootCauseAnalysis.ishikawa.measurement.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {output.rootCauseAnalysis.ishikawa.measurement.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">Причин не выявлено</p>
                  )}
                </div>

                {/* Environment */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2">🌍 Окружение (Environment)</h4>
                  {output.rootCauseAnalysis.ishikawa.environment.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {output.rootCauseAnalysis.ishikawa.environment.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">Причин не выявлено</p>
                  )}
                </div>
              </div>
            </div>

            {/* Анализ "5 Почему" */}
            <div>
              <h4 className="mb-3">Анализ "5 Почему"</h4>
              <div className={output.rootCauseAnalysis.fiveWhyBranches.length === 2 ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
                {output.rootCauseAnalysis.fiveWhyBranches.map((branch, branchIdx) => (
                  <div key={branchIdx} className="rounded-lg border p-4 h-full flex flex-col">
                    <div className="mb-3">
                      <p className="mb-1">
                        <strong>Начальная причина:</strong>
                      </p>
                      <p className="text-muted-foreground">{branch.initialCause}</p>
                    </div>
                    
                    <div className="mb-3 space-y-1">
                      {branch.whyChain.map((why, whyIdx) => {
                        const [question, answer] = why.split(' - ');
                        return (
                          <>
                            <p key={`q-${whyIdx}`} className="mt-2">
                              <strong>{whyIdx + 1}.</strong> {question}
                            </p>
                            <p key={`a-${whyIdx}`} className="text-muted-foreground pl-4">
                              - {answer}
                            </p>
                          </>
                        );
                      })}
                    </div>
                    
                    <div className="rounded bg-destructive/10 p-3 mt-auto">
                      <p className="mb-1">
                        <strong>🎯 Коренная причина:</strong>
                      </p>
                      <p className="text-destructive">{branch.rootCause}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* План контрмер */}
          <div>
            <h3 className="mb-4">План контрмер</h3>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Контрмера</TableHead>
                    <TableHead className="w-[15%]">Срок исполнения</TableHead>
                    <TableHead className="w-[20%]">Ответственный</TableHead>
                    <TableHead className="w-[25%]">KPI результата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {output.countermeasuresPlan.map((measure, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-normal break-words">{measure.action}</TableCell>
                      <TableCell className="whitespace-normal">{measure.deadline}</TableCell>
                      <TableCell className="whitespace-normal break-words">{measure.responsible}</TableCell>
                      <TableCell className="whitespace-normal break-words">{measure.kpi}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Стандартизация */}
          <div>
            <h3 className="mb-2">Стандартизация</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{output.standardize}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
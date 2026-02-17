import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { CheckCircle2, RotateCcw } from "lucide-react";
import type { TestResult } from "../../../entities/ai-test";

interface TestResultViewerProps {
  result: TestResult;
  outputSchema: Record<string, "text" | "table">;
  onReset: () => void;
}

export function TestResultViewer({ result, outputSchema, onReset }: TestResultViewerProps) {
  const renderValue = (key: string, value: unknown, type: "text" | "table") => {
    if (type === "table" && Array.isArray(value)) {
      return renderTable(value);
    }

    if (type === "text") {
      return (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{String(value)}</p>
        </div>
      );
    }

    // Fallback - пытаемся отобразить как есть
    if (Array.isArray(value)) {
      return renderTable(value);
    }

    return <p className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</p>;
  };

  const renderTable = (data: unknown[]) => {
    if (data.length === 0) {
      return <p className="text-muted-foreground">Нет данных</p>;
    }

    const firstItem = data[0];
    
    // Если это массив объектов
    if (typeof firstItem === "object" && firstItem !== null) {
      const columns = Object.keys(firstItem as Record<string, unknown>);

      return (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {String((row as Record<string, unknown>)[col] || "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // Если это массив примитивов
    return (
      <ul className="list-disc list-inside space-y-1">
        {data.map((item, idx) => (
          <li key={idx}>{String(item)}</li>
        ))}
      </ul>
    );
  };

  const formatSectionTitle = (key: string) => {
    // camelCase -> Title Case
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl">Отчет готов</h2>
        </div>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Создать новый тест
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(result).map(([key, value]) => {
          const type = outputSchema[key] || "text";
          
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{formatSectionTitle(key)}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderValue(key, value, type)}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

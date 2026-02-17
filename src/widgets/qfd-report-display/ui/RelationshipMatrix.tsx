import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import type { CustomerRequirement, TechnicalCharacteristic, RelationshipMatrix as Matrix } from '../../../entities/qfd-report';

interface RelationshipMatrixProps {
  requirements: CustomerRequirement[];
  characteristics: TechnicalCharacteristic[];
  matrix: Matrix;
}

export function RelationshipMatrix({ requirements, characteristics, matrix }: RelationshipMatrixProps) {
  const getRelationship = (reqId: string, charId: string): string => {
    return matrix[`${reqId}_${charId}`] || '';
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Требования \ Характеристики</TableHead>
            {characteristics.map((char, index) => (
              <TableHead key={char.id} className="text-center min-w-[80px]">
                ТХ{index + 1}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.map((req, reqIndex) => (
            <TableRow key={req.id}>
              <TableCell>
                <div className="text-sm">
                  <span className="text-muted-foreground">Треб. {reqIndex + 1}:</span> {req.text}
                </div>
              </TableCell>
              {characteristics.map((char) => (
                <TableCell key={char.id} className="text-center text-lg">
                  {getRelationship(req.id, char.id)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Легенда для технических характеристик */}
      <div className="mt-4 space-y-1 text-sm text-muted-foreground">
        {characteristics.map((char, index) => (
          <div key={char.id}>
            <span>ТХ{index + 1}: {char.text} ({char.unit})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

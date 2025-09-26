import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function UnitListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[64px]">Icons with Links</TableHead>
              <TableHead className="w-[200px]">Unit(s)</TableHead>
              <TableHead>How They Match</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-3/4" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

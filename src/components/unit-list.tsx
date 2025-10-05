
'use client';

import { useRef } from 'react';
import type { UnitMatchingAIOutput } from '@/ai/flows/character-matching-ai';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useDownloadImage } from '@/hooks/use-download-image';
import { Terminal, AlertTriangle } from 'lucide-react';

type UnitListProps = {
  units: NonNullable<UnitMatchingAIOutput['units']>;
  isLoadingMore?: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  query?: string;
};

const LoadingRows = ({ count = 3 }: { count?: number }) => (
    <>
      {[...Array(count)].map((_, i) => (
        <TableRow key={`loading-${i}`}>
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
    </>
);


export function UnitList({ units, isLoadingMore, triggerRef, query }: UnitListProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useDownloadImage(contentRef, triggerRef, query || 'unit_list');

  return (
    <div ref={contentRef} className="bg-background p-4 sm:p-8 rounded-lg space-y-4">
      {query && (
          <div className="flex items-start gap-3 rounded-lg border border-unit-finder-accent/20 bg-card p-4">
              <Terminal className="h-5 w-5 flex-shrink-0 text-unit-finder-accent" />
              <div className="flex-1">
                  <p className="text-sm font-semibold text-unit-finder-accent">Unit Search Prompt</p>
                  <p className="text-muted-foreground italic">"{query}"</p>
              </div>
          </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Matching Units</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Unit</TableHead>
                <TableHead>How They Match</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit, index) => {
                return (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                     <Link href={unit.url} target="_blank" className="hover:underline text-unit-finder-accent">
                        {unit.name}
                     </Link>
                  </TableCell>
                  <TableCell>
                    {unit.description}
                  </TableCell>
                </TableRow>
                )
              })}
              {isLoadingMore && <LoadingRows count={3} />}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        <span>This result is AI-generated and may make mistakes.</span>
      </div>
    </div>
  );
}

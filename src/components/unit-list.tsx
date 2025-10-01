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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useDownloadImage } from '@/hooks/use-download-image';

type UnitListProps = {
  units: NonNullable<UnitMatchingAIOutput['units']>;
  isLoadingMore?: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  query?: string;
};

function getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const borderColors = [
    'border-sky-500',
    'border-green-500',
    'border-yellow-500',
    'border-red-500',
    'border-purple-500',
    'border-pink-500',
    'border-indigo-500',
    'border-teal-500',
    'border-orange-500',
    'border-blue-500',
  ];

const LoadingRows = ({ count = 5 }: { count?: number }) => (
    <>
      {[...Array(count)].map((_, i) => (
        <TableRow key={`loading-${i}`}>
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
    </>
);


export function UnitList({ units, isLoadingMore, triggerRef, query }: UnitListProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useDownloadImage(contentRef, triggerRef, query || 'unit_list');

  return (
    <div ref={contentRef}>
      <Card>
        <CardHeader>
          <CardTitle>Matching Units</CardTitle>
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
              {units.map((unit, index) => {
                const borderColorClass = borderColors[index % borderColors.length];

                return (
                <TableRow key={index}>
                  <TableCell>
                    {unit.imageUrl && (
                      <Link href={unit.url} target="_blank" className="relative group">
                          <Avatar className={cn('h-10 w-10 border-2', borderColorClass)}>
                          <AvatarImage src={unit.imageUrl} alt={unit.name} />
                          <AvatarFallback>
                              {getInitials(unit.name)}
                          </AvatarFallback>
                          </Avatar>
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>
                    {unit.description}
                  </TableCell>
                </TableRow>
                )
              })}
              {isLoadingMore && <LoadingRows count={5} />}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

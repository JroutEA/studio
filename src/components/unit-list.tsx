'use client';

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

type UnitListProps = {
  units: NonNullable<UnitMatchingAIOutput['units']>;
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


export function UnitList({ units }: UnitListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Units</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[64px]">Icon</TableHead>
              <TableHead className="w-[200px]">Unit</TableHead>
              <TableHead>How They Match</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit, index) => (
              <TableRow key={index}>
                <TableCell>
                  {unit.imageUrl && (
                     <Link href={unit.url} target="_blank" className="relative group">
                        <Avatar className={cn('h-10 w-10 border-2', borderColors[index % borderColors.length])}>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

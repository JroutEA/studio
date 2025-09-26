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
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
              <TableHead className="w-[100px] text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit, index) => (
              <TableRow key={index}>
                <TableCell>
                  {unit.imageUrl && (
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={unit.imageUrl} alt={unit.name} />
                      <AvatarFallback>
                        {getInitials(unit.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </TableCell>
                <TableCell className="font-medium">{unit.name}</TableCell>
                <TableCell>
                  {unit.description}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={unit.url} target="_blank">
                      <ArrowUpRight />
                      <span className="sr-only">
                        View {unit.name} on swgoh.gg
                      </span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

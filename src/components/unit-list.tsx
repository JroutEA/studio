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

type UnitListProps = {
  units: NonNullable<UnitMatchingAIOutput['units']>;
};

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
                    <img
                      src={unit.imageUrl}
                      alt={unit.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
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

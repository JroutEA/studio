'use client';

import type { CharacterMatchingAIOutput } from '@/ai/flows/character-matching-ai';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type CharacterListProps = {
  characters: NonNullable<CharacterMatchingAIOutput['characters']>;
};

export function CharacterList({ characters }: CharacterListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Characters</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[64px]">Icon</TableHead>
              <TableHead className="w-[200px]">Character</TableHead>
              <TableHead>How They Match</TableHead>
              <TableHead className="w-[100px] text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {characters.map((character, index) => (
              <TableRow key={index}>
                <TableCell>
                  {character.imageUrl && (
                    <Image
                      src={character.imageUrl}
                      alt={character.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{character.name}</TableCell>
                <TableCell>{character.description}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={character.url} target="_blank">
                      <ArrowUpRight />
                      <span className="sr-only">
                        View {character.name} on swgoh.gg
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

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

type CharacterListProps = {
  characters: CharacterMatchingAIOutput['characters'];
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
              <TableHead className="w-[200px]">Character</TableHead>
              <TableHead>How They Match</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {characters.map((character, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{character.name}</TableCell>
                <TableCell>{character.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

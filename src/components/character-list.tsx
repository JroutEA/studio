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
import { ArrowUpRight, LoaderCircle } from 'lucide-react';
import { useStreamableValue } from 'ai/rsc';
import type { StreamMessage } from '@/app/actions';
import { Skeleton } from './ui/skeleton';

type CharacterListProps = {
  characters: NonNullable<CharacterMatchingAIOutput['characters']>;
  stream: AsyncIterable<StreamMessage[]>;
};

export function CharacterList({ characters: initialCharacters, stream }: CharacterListProps) {
  const [data] = useStreamableValue(stream);

  const characters = initialCharacters.map(character => {
    const streamInfo = data?.find(d => d.characterName === character.name);
    return {
      ...character,
      status: streamInfo?.status || 'generating',
      description: streamInfo?.explanation || character.description,
    };
  });

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
                <TableCell>
                  {character.status === 'generating' ? (
                    <div className="flex items-center gap-2">
                       <LoaderCircle className="h-4 w-4 animate-spin" />
                       <span className="text-muted-foreground italic">Thinking...</span>
                    </div>
                  ) : (
                    character.description
                  )}
                </TableCell>
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

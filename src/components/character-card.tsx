'use client';

import type { CharacterMatchingAIOutput } from '@/ai/flows/character-matching-ai';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type CharacterCardProps = {
  character: CharacterMatchingAIOutput['characters'][number];
};

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300">
      <div className="aspect-[4/5] relative w-full bg-muted">
        <Image
          src={character.imageUrl}
          alt={`Icon for ${character.name}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline">{character.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{character.description}</CardDescription>
      </CardContent>
    </Card>
  );
}

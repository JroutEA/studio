'use client';

import type { CharacterMatchingAIOutput } from '@/ai/flows/character-matching-ai';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
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
  image: ImagePlaceholder;
};

export function CharacterCard({ character, image }: CharacterCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20">
      <div className="aspect-[4/5] relative w-full">
        <Image
          src={image.imageUrl}
          alt={image.description}
          data-ai-hint={image.imageHint}
          fill
          className="object-cover"
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

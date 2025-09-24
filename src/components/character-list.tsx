'use client';

import type { CharacterMatchingAIOutput } from '@/ai/flows/character-matching-ai';
import { CharacterCard } from './character-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

type CharacterListProps = {
  characters: CharacterMatchingAIOutput['characters'];
};

export function CharacterList({ characters }: CharacterListProps) {
  return (
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full"
    >
      <CarouselContent>
        {characters.map((character, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <CharacterCard
                character={character}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

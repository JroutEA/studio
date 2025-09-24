'use client';

import type { CharacterMatchingAIOutput } from '@/ai/flows/character-matching-ai';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CharacterCard } from './character-card';

type CharacterListProps = {
  characters: CharacterMatchingAIOutput['characters'];
};

export function CharacterList({ characters }: CharacterListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {characters.map((character, index) => (
        <CharacterCard
          key={character.name}
          character={character}
          image={PlaceHolderImages[index % PlaceHolderImages.length]}
        />
      ))}
    </div>
  );
}

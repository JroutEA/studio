'use client';

import type { SquadBuilderAIOutput } from '@/ai/flows/squad-builder-ai';
import { Card, CardContent, CardTitle } from './ui/card';
import Link from 'next/link';
import { Crown, UserPlus, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

function getInitials(name: string): string {
    if (name === "New Unit") return "NU";
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

type Squad = NonNullable<SquadBuilderAIOutput['squads']>[0];

type SavedSquadsListProps = {
  squads: Squad[];
  onToggleSave: (squad: Squad) => void;
};

const CharacterPortrait = ({ character }: {
    character: NonNullable<SquadBuilderAIOutput['squads']>[0]['leader'];
}) => (
    <div className="relative text-center w-12 group">
      <Link href={character.url} target="_blank" className="relative">
        <Avatar className="w-12 h-12 mx-auto border-2 border-transparent group-hover:border-primary">
          <AvatarImage src={character.imageUrl} alt={character.name} />
          <AvatarFallback className="text-xs">
            {getInitials(character.name)}
          </AvatarFallback>
        </Avatar>
      </Link>
      <p className="text-xs mt-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">{character.name}</p>
    </div>
);


export function SavedSquadsList({ squads, onToggleSave }: SavedSquadsListProps) {
  return (
    <div className="space-y-4">
      {squads.map((squad, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="p-3">
             <div className="flex justify-between items-start">
                <CardTitle className="text-base font-semibold">{squad.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleSave(squad)}
                  className="shrink-0 h-8 w-8"
                >
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="sr-only">Unsave Squad</span>
                </Button>
            </div>
            <div className="flex flex-wrap items-start gap-2 mt-2">
              <CharacterPortrait character={squad.leader} />
              {squad.members.map((member, memberIndex) => (
                <CharacterPortrait key={memberIndex} character={member} />
              ))}
              {squad.ally && (
                 <CharacterPortrait character={squad.ally} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

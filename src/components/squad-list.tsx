'use client';

import type { SquadBuilderAIOutput } from '@/ai/flows/squad-builder-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { ArrowUpRight, Crown, UserPlus } from 'lucide-react';

type SquadListProps = {
  squads: NonNullable<SquadBuilderAIOutput['squads']>;
  title?: string;
};

const CharacterPortrait = ({ character, isLeader = false, isAlly = false }: {
    character: NonNullable<SquadBuilderAIOutput['squads']>[0]['leader'];
    isLeader?: boolean;
    isAlly?: boolean;
}) => (
    <div className="relative text-center w-20">
      <Link href={character.url} target="_blank" className="relative group">
        <img
          src={character.imageUrl}
          alt={character.name}
          width={80}
          height={80}
          className="rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all mx-auto"
        />
        {isLeader && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
            <Crown className="w-4 h-4" />
          </div>
        )}
        {isAlly && (
          <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full p-1">
            <UserPlus className="w-4 h-4" />
          </div>
        )}
      </Link>
      <p className="text-xs mt-1 truncate">{character.name}</p>
    </div>
);


export function SquadList({ squads, title }: SquadListProps) {
  return (
    <div className="space-y-8">
       {title && <h2 className="text-2xl font-bold tracking-tight font-headline">{title}</h2>}
      {squads.map((squad, index) => (
        <Card key={index} className="shadow-md">
          <CardHeader>
            <CardTitle>{squad.name}</CardTitle>
            {squad.description && <CardDescription>{squad.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-start gap-4">
              <CharacterPortrait character={squad.leader} isLeader />
              {squad.members.map((member, memberIndex) => (
                <CharacterPortrait key={memberIndex} character={member} />
              ))}
              {squad.ally && (
                 <CharacterPortrait character={squad.ally} isAlly />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

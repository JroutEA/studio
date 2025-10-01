'use client';

import { useRef } from 'react';
import type { SquadBuilderAIOutput } from '@/ai/flows/squad-builder-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { Crown, UserPlus, Star, Terminal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { SquadListSkeleton } from './squad-list-skeleton';
import { Button } from './ui/button';
import { useDownloadImage } from '@/hooks/use-download-image';

function getInitials(name: string): string {
    if (name === "New Unit") return "NU";
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const borderColors = [
    'border-sky-500',
    'border-green-500',
    'border-yellow-500',
    'border-red-500',
    'border-purple-500',
    'border-pink-500',
    'border-indigo-500',
    'border-teal-500',
    'border-orange-500',
    'border-blue-500',
  ];

type Squad = NonNullable<SquadBuilderAIOutput['squads']>[0];

type SquadListProps = {
  squads: NonNullable<SquadBuilderAIOutput['squads']>;
  title?: string;
  isLoadingMore?: boolean;
  savedSquads?: Squad[];
  onToggleSave?: (squad: Squad) => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  query?: string;
};

const CharacterPortrait = ({ character, isLeader = false, isAlly = false, colorClass = '' }: {
    character: NonNullable<SquadBuilderAIOutput['squads']>[0]['leader'];
    isLeader?: boolean;
    isAlly?: boolean;
    colorClass?: string;
}) => (
    <div className="relative text-center w-20">
      <Link href={character.url} target="_blank" className="relative group">
        <Avatar className={cn("w-20 h-20 mx-auto border-2 transition-all", colorClass)}>
          <AvatarImage src={character.imageUrl} alt={character.name} />
          <AvatarFallback className="text-lg">
            {getInitials(character.name)}
          </AvatarFallback>
        </Avatar>
        {isLeader && (
          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
            <Crown className="w-4 h-4" />
          </div>
        )}
        {isAlly && (
          <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full p-1">
            <UserPlus className="w-4 h-4" />
          </div>
        )}
      </Link>
      <p className="text-xs mt-1 truncate">{character.name}</p>
    </div>
);


export function SquadList({ squads, title, isLoadingMore = false, savedSquads = [], onToggleSave, triggerRef, query }: SquadListProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useDownloadImage(contentRef, triggerRef, query || title || 'squad_list');
  
  const isSquadSaved = (squad: Squad) => {
    return savedSquads.some(saved => saved.name === squad.name && saved.leader.name === squad.leader.name);
  };
  
  return (
    <div ref={contentRef} className="space-y-8 bg-background p-4 sm:p-8 rounded-lg">
       {query && (
          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-card p-4">
              <Terminal className="h-5 w-5 flex-shrink-0 text-primary" />
              <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">{title ? `${title} Prompt` : 'Squad Builder Prompt'}</p>
                  <p className="text-muted-foreground italic">"{query}"</p>
              </div>
          </div>
       )}
      {squads.map((squad, index) => (
        <Card key={index} className="shadow-md">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{squad.name}</CardTitle>
                {squad.description && <CardDescription>{squad.description}</CardDescription>}
              </div>
              {onToggleSave && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleSave(squad)}
                  className="shrink-0"
                >
                  <Star className={cn("w-5 h-5", isSquadSaved(squad) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                  <span className="sr-only">Save Squad</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-start gap-4">
              <CharacterPortrait character={squad.leader} isLeader colorClass={borderColors[0]} />
              {squad.members.map((member, memberIndex) => (
                <CharacterPortrait key={memberIndex} character={member} colorClass={borderColors[(memberIndex + 1) % borderColors.length]} />
              ))}
              {squad.ally && (
                 <CharacterPortrait character={squad.ally} isAlly colorClass={borderColors[5 % borderColors.length]} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {isLoadingMore && <SquadListSkeleton />}
    </div>
  );
}

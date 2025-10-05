
'use client';

import { useRef } from 'react';
import type { SquadBuilderAIOutput } from '@/ai/flows/squad-builder-ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { Star, Terminal, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SquadListSkeleton } from './squad-list-skeleton';
import { Button } from './ui/button';
import { useDownloadImage } from '@/hooks/use-download-image';

type Squad = NonNullable<SquadBuilderAIOutput['squads']>[0];
type Character = Squad['leader'];

type SquadListProps = {
  squads: NonNullable<SquadBuilderAIOutput['squads']>;
  title?: string;
  isLoadingMore?: boolean;
  savedSquads?: Squad[];
  onToggleSave?: (squad: Squad) => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  query?: string;
};

const CharacterLink = ({ character, label }: { character: Character, label?: string }) => (
    <div className="flex items-baseline gap-2">
        <Link href={character.url} target="_blank" className="font-medium hover:underline text-squad-builder-accent">
            {character.name}
        </Link>
        {label && <span className="text-xs text-muted-foreground">({label})</span>}
    </div>
);


export function SquadList({ squads, title, isLoadingMore = false, savedSquads = [], onToggleSave, triggerRef, query }: SquadListProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useDownloadImage(contentRef, triggerRef, query || title || 'squad_list');
  
  const isSquadSaved = (squad: Squad) => {
    return savedSquads.some(saved => saved.leader.name === squad.leader.name && saved.description === squad.description);
  };
  
  return (
    <div ref={contentRef} className="space-y-4 bg-background p-4 sm:p-8 rounded-lg">
       {query && (
          <div className="flex items-start gap-3 rounded-lg border border-squad-builder-accent/20 bg-card p-4">
              <Terminal className="h-5 w-5 flex-shrink-0 text-squad-builder-accent" />
              <div className="flex-1">
                  <p className="text-sm font-semibold text-squad-builder-accent">{title ? `${title} Prompt` : 'Squad Builder Prompt'}</p>
                  <p className="text-muted-foreground italic">"{query}"</p>
              </div>
          </div>
       )}
       <div className="space-y-8">
        {squads.map((squad, index) => (
          <Card key={index} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                {squad.description && <CardDescription>{squad.description}</CardDescription>}
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
              <div className="space-y-1">
                <CharacterLink character={squad.leader} label="Leader" />
                {squad.members.map((member, memberIndex) => (
                  <CharacterLink key={memberIndex} character={member} />
                ))}
                {squad.ally && (
                   <CharacterLink character={squad.ally} label="Ally" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
       </div>
      {isLoadingMore && <SquadListSkeleton />}
      <div className="flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        <span>This result is AI-generated and may make mistakes.</span>
      </div>
    </div>
  );
}

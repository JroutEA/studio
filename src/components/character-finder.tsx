'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { findCharacters, buildSquad, type FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WandSparkles, LoaderCircle, History, Users } from 'lucide-react';
import { CharacterList } from './character-list';
import { CharacterListSkeleton } from './character-list-skeleton';
import { SquadList } from './squad-list';
import { SquadListSkeleton } from './squad-list-skeleton';

const initialState: FormState = {
  message: '',
};

function CharacterSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <WandSparkles
            className="mr-2 h-4 w-4"
            suppressHydrationWarning
          />
          Find Characters
        </>
      )}
    </Button>
  );
}

function SquadSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Building...
        </>
      ) : (
        <>
          <Users
            className="mr-2 h-4 w-4"
            suppressHydrationWarning
          />
          Build Squad
        </>
      )}
    </Button>
  );
}

export function CharacterFinder() {
  const [characterState, characterFormAction] = useActionState(findCharacters, initialState);
  const [squadState, squadFormAction] = useActionState(buildSquad, initialState);
  
  const { pending } = useFormStatus();
  const { toast } = useToast();
  
  const [history, setHistory] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const characterFormRef = useRef<HTMLFormElement>(null);
  const squadFormRef = useRef<HTMLFormElement>(null);
  const characterTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const squadTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const [activeTab, setActiveTab] = useState('character-finder');
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const state = activeTab === 'character-finder' ? characterState : squadState;

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('swgoh_query_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to parse history from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (state.message === 'success' && state.query) {
      if (!history.includes(state.query)) {
        const newHistory = [state.query, ...history].slice(0, 20); // Limit history to 20 items
        setHistory(newHistory);
        localStorage.setItem('swgoh_query_history', JSON.stringify(newHistory));
      }
    } else if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast, history]);

  const handleHistoryClick = (query: string) => {
    if (activeTab === 'character-finder' && characterTextAreaRef.current) {
      characterTextAreaRef.current.value = query;
    } else if (activeTab === 'squad-builder' && squadTextAreaRef.current) {
      squadTextAreaRef.current.value = query;
    }
    setIsHistoryOpen(false);
  };
  
  return (
    <div className="space-y-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-3xl">SWGOH AI Assistant</CardTitle>
              <CardDescription>
                Find characters or build squads for Star Wars: Galaxy of Heroes.
              </CardDescription>
            </div>
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <History className="h-4 w-4" suppressHydrationWarning />
                  <span className="sr-only">View query history</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Query History</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  {history.length > 0 ? (
                    history.map((query, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                        onClick={() => handleHistoryClick(query)}
                      >
                        {query}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Your past queries will appear here.
                    </p>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          {isClient && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="character-finder">Character Finder</TabsTrigger>
                <TabsTrigger value="squad-builder">Squad Builder</TabsTrigger>
              </TabsList>
              <TabsContent value="character-finder" className="mt-4">
                 <form action={characterFormAction} ref={characterFormRef} className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="character-query">Your Query</Label>
                    <Textarea
                      id="character-query"
                      name="query"
                      ref={characterTextAreaRef}
                      placeholder="e.g., 'A Jedi tank that can counterattack and has high health.'"
                      required
                      rows={3}
                      className="text-base"
                    />
                  </div>
                  <CharacterSubmitButton />
                </form>
              </TabsContent>
              <TabsContent value="squad-builder" className="mt-4">
                <form action={squadFormAction} ref={squadFormRef} className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="squad-query">Your Query</Label>
                    <Textarea
                      id="squad-query"
                      name="query"
                      ref={squadTextAreaRef}
                      placeholder="e.g., 'A squad to beat the Sith Triumvirate Raid with Jedi.' or 'A good starter team for Phoenix faction.'"
                      required
                      rows={3}
                      className="text-base"
                    />
                  </div>
                  <SquadSubmitButton />
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <div className="max-w-4xl mx-auto">
        {pending && activeTab === 'character-finder' && <CharacterListSkeleton />}
        {pending && activeTab === 'squad-builder' && <SquadListSkeleton />}

        {!pending && activeTab === 'character-finder' && characterState.characters && characterState.characters.length > 0 && (
          <CharacterList characters={characterState.characters} />
        )}

        {!pending && activeTab === 'squad-builder' && squadState.squads && squadState.squads.length > 0 && (
          <SquadList squads={squadState.squads} />
        )}

        {!pending && (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            {activeTab === 'character-finder' && (!characterState.characters || characterState.characters.length === 0) &&
              <>
                <WandSparkles className="mx-auto h-12 w-12 mb-4" suppressHydrationWarning />
                <h3 className="text-lg font-semibold">Your matched characters will appear here</h3>
                <p>Enter a description above to get started.</p>
              </>
            }
            {activeTab === 'squad-builder' && (!squadState.squads || squadState.squads.length === 0) &&
              <>
                <Users className="mx-auto h-12 w-12 mb-4" suppressHydrationWarning />
                <h3 className="text-lg font-semibold">Your generated squads will appear here</h3>
                <p>Describe the squad you want to build above.</p>
              </>
            }
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { findCharacters, type FormState } from '@/app/actions';
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
import { WandSparkles, LoaderCircle, History } from 'lucide-react';
import { CharacterList } from './character-list';
import { CharacterListSkeleton } from './character-list-skeleton';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
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

export function CharacterFinder() {
  const [state, formAction] = useActionState(findCharacters, initialState);
  const { pending } = useFormStatus();
  const { toast } = useToast();
  const [history, setHistory] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
    if (textAreaRef.current) {
      textAreaRef.current.value = query;
    }
    setIsHistoryOpen(false);
  };
  
  return (
    <div className="space-y-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-3xl">Find Your SWGOH Character</CardTitle>
              <CardDescription>
                Describe the characteristics of the character you're looking for, and
                our AI will find the best matches for you from Star Wars: Galaxy of
                Heroes.
              </CardDescription>
            </div>
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <History className="h-4 w-4" />
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
          <form action={formAction} ref={formRef} className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="query">Your Query</Label>
              <Textarea
                id="query"
                name="query"
                ref={textAreaRef}
                placeholder="e.g., 'A Jedi tank that can counterattack and has high health.'"
                required
                rows={3}
                className="text-base"
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <div className="max-w-4xl mx-auto">
        {pending && <CharacterListSkeleton />}

        {state.characters && state.characters.length > 0 && (
          <CharacterList characters={state.characters} />
        )}

        {!pending && (!state.characters || state.characters.length === 0) && (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            <WandSparkles
              className="mx-auto h-12 w-12 mb-4"
              suppressHydrationWarning
            />
            <h3 className="text-lg font-semibold">Your matched characters will appear here</h3>
            <p>Enter a description above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

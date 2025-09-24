'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { findCharacters, type FormState, type StreamMessage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { WandSparkles, LoaderCircle } from 'lucide-react';
import { CharacterList } from './character-list';
import { CharacterListSkeleton } from './character-list-skeleton';
import type { StreamableValue } from 'ai/rsc';


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

  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  const stream = state.stream as StreamableValue<StreamMessage[]> | undefined;

  return (
    <div className="space-y-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Find Your SWGOH Character</CardTitle>
          <CardDescription>
            Describe the characteristics of the character you're looking for, and
            our AI will find the best matches for you from Star Wars: Galaxy of
            Heroes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="query">Your Query</Label>
              <Textarea
                id="query"
                name="query"
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

        {state.characters && state.characters.length > 0 && stream && (
          <CharacterList characters={state.characters} stream={stream} />
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

'use server';

import {z} from 'zod';
import {
  characterMatchingAI,
  type CharacterMatchingAIOutput,
} from '@/ai/flows/character-matching-ai';
import {
  explainCharacterMatches,
  type ExplainCharacterMatchesOutput,
} from '@/ai/flows/explain-character-matches';
import {createStreamableValue} from 'ai/rsc';

const schema = z.object({
  query: z
    .string({
      required_error: 'Please describe the character you are looking for.',
    })
    .min(
      10,
      'Please provide more details about the character (at least 10 characters).'
    ),
});

export type FormState = {
  message: string;
  characters?: CharacterMatchingAIOutput['characters'];
  stream?: ReturnType<typeof createStreamableValue<StreamMessage[]>>['value'];
};

export type StreamMessage = {
  status: 'generating' | 'complete';
  characterName: string;
  explanation?: string;
};

export async function findCharacters(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    query: formData.get('query'),
  });

  if (!validatedFields.success) {
    return {
      message:
        validatedFields.error.flatten().fieldErrors.query?.[0] ??
        'Invalid query.',
    };
  }

  const query = validatedFields.data.query;
  const stream = createStreamableValue<StreamMessage[]>();

  // Use an IIFE to kick off the async streaming work
  // without blocking the initial response.
  (async () => {
    let initialCharacters: CharacterMatchingAIOutput['characters'] = [];
    try {
      // 1. First, get the list of matching characters.
      const result = await characterMatchingAI({ query });
      if (!result.characters || result.characters.length === 0) {
        // This case is handled in the main function body, but good to have a safeguard.
        stream.done();
        return;
      }
      initialCharacters = result.characters;

      // 2. Stream an update to the client to show we are generating details.
      const generatingStream: StreamMessage[] = initialCharacters.map(
        (character) => ({
          status: 'generating',
          characterName: character.name,
        })
      );
      stream.update(generatingStream);

      // 3. Get the detailed explanations for each character.
      const explanations = await explainCharacterMatches({
        query,
        characterNames: initialCharacters.map((c) => c.name),
      });

      // 4. Stream the final, complete state.
      const finalStream: StreamMessage[] = initialCharacters.map(
        (character) => {
          const explanation = explanations.find(
            (e) => e.characterName === character.name
          )?.explanation;
          return {
            status: 'complete',
            characterName: character.name,
            explanation: explanation || 'No explanation provided.',
          };
        }
      );
      stream.done(finalStream);
    } catch (e) {
      console.error('Error during streaming:', e);
      // Optionally, stream an error state back to the client.
      // For now, we signal completion to prevent hanging.
      stream.done();
    }
  })();

  try {
    // We still need to get the initial character list for the immediate response.
    // This call is cached and will be very fast if the streaming IIFE has already run it.
    const initialResult = await characterMatchingAI({ query });

    if (!initialResult.characters || initialResult.characters.length === 0) {
      return {
        message: 'Could not find any matching characters. Please try a different query.',
      };
    }

    return {
      message: 'success',
      characters: initialResult.characters,
      stream: stream.value,
    };
  } catch (e) {
    console.error('Error in findCharacters action:', e);
    return {
      message: 'An error occurred while searching for characters. Please try again later.',
    };
  }
}

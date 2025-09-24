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
};

export type StreamMessage = {
  status: 'generating' | 'complete';
  characterName: string;
  explanation?: string;
};

export async function findCharacters(
  prevState: FormState,
  formData: FormData
) {
  'use server';
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
  const stream = createStreamableValue<StreamMessage[]>([]);

  (async () => {
    try {
      const result = await characterMatchingAI({
        query: query,
      });
      if (!result.characters || result.characters.length === 0) {
        // This case is handled on the client, but good to have
        return;
      }

      const initialStream: StreamMessage[] = result.characters.map(
        (character) => ({
          status: 'generating',
          characterName: character.name,
        })
      );
      stream.update(initialStream);

      const explanations = await explainCharacterMatches({
        query,
        characterNames: result.characters.map((c) => c.name),
      });

      const finalStream: StreamMessage[] = result.characters.map(
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
      console.error(e);
      // We can optionally stream an error message back to the client
      // For now, we'll rely on the client-side error handling
    }
  })();

  try {
    const result = await characterMatchingAI({
      query: validatedFields.data.query,
    });
    if (!result.characters || result.characters.length === 0) {
      return {
        message:
          'Could not find any matching characters. Please try a different query.',
      };
    }
    return {
      message: 'success',
      characters: result.characters,
      // @ts-ignore
      stream: stream.value,
    };
  } catch (e) {
    console.error(e);
    return {
      message:
        'An error occurred while searching for characters. Please try again later.',
    };
  }
}

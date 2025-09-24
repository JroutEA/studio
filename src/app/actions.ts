'use server';

import {z} from 'zod';
import {
  characterMatchingAI,
  type CharacterMatchingAIOutput,
} from '@/ai/flows/character-matching-ai';

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
  query?: string;
  characters?: CharacterMatchingAIOutput['characters'];
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

  try {
    const result = await characterMatchingAI({ query });

    if (!result.characters || result.characters.length === 0) {
      return {
        message: 'Could not find any matching characters. Please try a different query.',
        query,
      };
    }

    return {
      message: 'success',
      characters: result.characters,
      query,
    };
  } catch (e) {
    console.error('Error in findCharacters action:', e);
    return {
      message: 'An error occurred while searching for characters. Please try again later.',
      query,
    };
  }
}

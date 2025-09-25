'use server';

import {z} from 'zod';
import {
  characterMatchingAI,
  type CharacterMatchingAIOutput,
} from '@/ai/flows/character-matching-ai';
import {
  squadBuilderAI,
  type SquadBuilderAIOutput,
} from '@/ai/flows/squad-builder-ai';

const findCharactersSchema = z.object({
  query: z
    .string({
      required_error: 'Please describe the character you are looking for.',
    })
    .min(
      10,
      'Please provide more details about the character (at least 10 characters).'
    ),
});

const buildSquadSchema = z.object({
  query: z
    .string({
      required_error: 'Please describe the squad you want to build.',
    })
    .min(10, 'Please provide more details about the squad (at least 10 characters).'),
});

export type FormState = {
  message: string;
  query?: string;
  characters?: CharacterMatchingAIOutput['characters'];
  squads?: SquadBuilderAIOutput['squads'];
};

export async function findCharacters(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = findCharactersSchema.safeParse({
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

export async function buildSquad(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = buildSquadSchema.safeParse({
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
    const result = await squadBuilderAI({ query });
    if (!result.squads || result.squads.length === 0) {
      return {
        message: 'Could not generate any matching squads. Please try a different query.',
        query,
      };
    }

    return {
      message: 'success',
      squads: result.squads,
      query,
    };
  } catch (e) {
    console.error('Error in buildSquad action:', e);
    return {
      message: 'An error occurred while building the squad. Please try again later.',
      query,
    };
  }
}

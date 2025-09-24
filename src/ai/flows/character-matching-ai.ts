'use server';

/**
 * @fileOverview A SWGOH character matching AI agent.
 *
 * - characterMatchingAI - A function that handles the character matching process.
 * - CharacterMatchingAIInput - The input type for the characterMatchingAI function.
 * - CharacterMatchingAIOutput - The return type for the characterMatchingAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CharacterMatchingAIInputSchema = z.object({
  query: z.string().describe('The query describing the desired character characteristics.'),
});
export type CharacterMatchingAIInput = z.infer<typeof CharacterMatchingAIInputSchema>;

const CharacterMatchingAIOutputSchema = z.object({
  characters: z.array(
    z.object({
      name: z.string().describe('The name of the matched character.'),
      description: z
        .string()
        .describe('How the character satisfies the specified characteristics.'),
    })
  ).describe('A list of matched characters and their descriptions.'),
});
export type CharacterMatchingAIOutput = z.infer<typeof CharacterMatchingAIOutputSchema>;

export async function characterMatchingAI(input: CharacterMatchingAIInput): Promise<CharacterMatchingAIOutput> {
  return characterMatchingAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'characterMatchingAIPrompt',
  input: {schema: CharacterMatchingAIInputSchema},
  output: {schema: CharacterMatchingAIOutputSchema},
  prompt: `You are an expert in Star Wars: Galaxy of Heroes (SWGOH). Your task is to identify characters from the game that match a user's description.

  The user will provide a query describing the desired characteristics of a character. You should analyze this query and identify at least 10 characters from SWGOH that best match these characteristics.

  For each character, provide the character's name and a brief description of how they satisfy the user's query. Ensure that the characters are actual characters available in SWGOH.

  Query: {{{query}}}`,
});

const characterMatchingAIFlow = ai.defineFlow(
  {
    name: 'characterMatchingAIFlow',
    inputSchema: CharacterMatchingAIInputSchema,
    outputSchema: CharacterMatchingAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

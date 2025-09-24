'use server';

/**
 * @fileOverview This file defines a Genkit flow to explain how characters match a user's query.
 *
 * - explainCharacterMatches - A function that takes a user query and a list of character names, and returns an explanation for each character.
 * - ExplainCharacterMatchesInput - The input type for the explainCharacterMatches function.
 * - ExplainCharacterMatchesOutput - The return type for the explainCharacterMatches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCharacterMatchesInputSchema = z.object({
  query: z.string().describe('The user query describing desired character characteristics.'),
  characterNames: z.array(z.string()).describe('A list of character names to explain how they match the query.'),
});
export type ExplainCharacterMatchesInput = z.infer<typeof ExplainCharacterMatchesInputSchema>;

const ExplainCharacterMatchesOutputSchema = z.array(z.object({
  characterName: z.string().describe('The name of the character.'),
  explanation: z.string().describe('An explanation of how the character matches the query.'),
})).describe('A list of character names and their explanations.');
export type ExplainCharacterMatchesOutput = z.infer<typeof ExplainCharacterMatchesOutputSchema>;

export async function explainCharacterMatches(input: ExplainCharacterMatchesInput): Promise<ExplainCharacterMatchesOutput> {
  return explainCharacterMatchesFlow(input);
}

const explainCharacterMatchesPrompt = ai.definePrompt({
  name: 'explainCharacterMatchesPrompt',
  input: {schema: ExplainCharacterMatchesInputSchema},
  output: {schema: ExplainCharacterMatchesOutputSchema},
  prompt: `You are an expert in Star Wars: Galaxy of Heroes. A user has provided a query describing desired character characteristics:

  Query: {{{query}}}

You are given a list of character names. For each character, explain in detail how they match the query. Be specific and cover all aspects of the query.

  Characters: {{characterNames}}

  Format your output as a JSON array of objects, where each object has a "characterName" and an "explanation" field.
`,
});

const explainCharacterMatchesFlow = ai.defineFlow(
  {
    name: 'explainCharacterMatchesFlow',
    inputSchema: ExplainCharacterMatchesInputSchema,
    outputSchema: ExplainCharacterMatchesOutputSchema,
  },
  async input => {
    const {output} = await explainCharacterMatchesPrompt(input);
    return output!;
  }
);

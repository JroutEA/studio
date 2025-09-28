'use server';

/**
 * @fileOverview A SWGOH unit (character or ship) matching AI agent.
 *
 * - unitMatchingAI - A function that handles the unit matching process.
 * - UnitMatchingAIInput - The input type for the unitMatchingAI function.
 * - UnitMatchingAIOutput - The return type for the unitMatchingAI function.
 */

import {ai} from '@/ai/genkit';
import { wikiSearchTool } from '@/ai/tools/wiki-search';
import {z} from 'genkit';

const UnitMatchingAIInputSchema = z.object({
  query: z.string().describe('The query describing the desired unit (character or ship) characteristics.'),
  count: z.number().optional().default(10).describe('The number of units to find.'),
});
export type UnitMatchingAIInput = z.infer<typeof UnitMatchingAIInputSchema>;

const UnitSchema = z.object({
  name: z.string().describe('The name of the matched unit (character or ship).'),
  imageUrl: z.string().describe("The URL of the unit's icon on swgoh.gg."),
  url: z.string().url().describe("The URL of the unit's page on swgoh.gg."),
  description: z
    .string()
    .describe('How the unit satisfies the specified characteristics.'),
});

const UnitMatchingAIOutputSchema = z.object({
  units: z.array(UnitSchema).describe('A list of matched units (characters or ships) and their descriptions.'),
});
export type UnitMatchingAIOutput = z.infer<typeof UnitMatchingAIOutputSchema>;

export async function unitMatchingAI(input: UnitMatchingAIInput): Promise<UnitMatchingAIOutput> {
  return unitMatchingAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'unitMatchingAIPrompt',
  input: {schema: UnitMatchingAIInputSchema},
  output: {schema: UnitMatchingAIOutputSchema},
  tools: [wikiSearchTool],
  prompt: `You are an expert in Star Wars: Galaxy of Heroes (SWGOH). Your task is to identify units (characters OR ships) from the game that match a user's description.

You MUST use information from two sources to provide the best possible answer:
1.  Your built-in knowledge of swgoh.gg for unit URLs, icon URLs, and basic stats. This includes knowing the difference between character and ship pages (e.g., /characters/ vs /ships/).
2.  The provided \`wikiSearch\` tool to get detailed, up-to-date information on abilities, strategies, and synergies from swgoh.wiki.

You will identify {{{count}}} units from SWGOH that best match the user's characteristics.

For each unit, provide:
1. The unit's name.
2. The URL for the unit's small, public icon on swgoh.gg. These are usually square portraits.
3. The URL for the unit's page on swgoh.gg.
4. A brief description of how they satisfy the user's query, synthesizing information from both swgoh.gg and your search results from the wiki.

Ensure that the units are actual characters or ships available in SWGOH.

Query: {{{query}}}`,
});

const unitMatchingAIFlow = ai.defineFlow(
  {
    name: 'unitMatchingAIFlow',
    inputSchema: UnitMatchingAIInputSchema,
    outputSchema: UnitMatchingAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    if (!output) {
      return { units: [] };
    }

    // The model sometimes returns 'characters' instead of 'units'. Handle both cases.
    const result = { units: (output as any).characters || output.units || [] };
    return result;
  }
);

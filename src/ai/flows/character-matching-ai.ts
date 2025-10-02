
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
import { unitMatchingAIPrompt } from '@/ai/prompts';


const UnitMatchingAIInputSchema = z.object({
  query: z.string().describe('The query describing the desired unit (character or ship) characteristics.'),
  count: z.number().optional().default(10).describe('The number of units to find.'),
  loadMoreQuery: z.string().optional().describe('An optional previous query to ensure new results are returned when loading more.'),
});
export type UnitMatchingAIInput = z.infer<typeof UnitMatchingAIInputSchema>;

const UnitSchema = z.object({
  name: z.string().describe('The name of the matched unit (character or ship).'),
  imageUrl: z.string().describe("The URL of the unit's icon on swgoh.gg."),
  url: z.string().url().describe("The URL of the unit's page on swgoh.gg."),
  description: z
    .string()
    .describe('A concise, one-sentence description of how the unit satisfies the specified characteristics.'),
});

const UnitMatchingAIOutputSchema = z.object({
  units: z.array(UnitSchema).describe('A list of matched units (characters or ships) and their descriptions.'),
  isSquadQuery: z.boolean().optional().describe('Set to true if the user\'s query is asking to build a squad of multiple characters instead of finding individual units.'),
});
export type UnitMatchingAIOutput = z.infer<typeof UnitMatchingAIOutputSchema>;

export async function unitMatchingAI(input: UnitMatchingAIInput): Promise<UnitMatchingAIOutput> {
  return unitMatchingAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'unitMatchingAIPrompt',
  prompt: unitMatchingAIPrompt,
  input: {schema: UnitMatchingAIInputSchema},
  output: {schema: UnitMatchingAIOutputSchema},
  tools: [wikiSearchTool],
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
      throw new Error('The AI model failed to generate a valid response. This could be due to a content filter or an internal error. Please try a different query.');
    }
    
    // Gracefully handle cases where the model returns 'characters' instead of 'units' or nothing at all
    const anyOutput = output as any;
    const units = anyOutput.units || anyOutput.characters || [];
    const isSquadQuery = anyOutput.isSquadQuery || false;

    return { units, isSquadQuery };
  }
);

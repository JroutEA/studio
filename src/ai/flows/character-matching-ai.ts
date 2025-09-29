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
  input: {schema: UnitMatchingAIInputSchema},
  output: {schema: UnitMatchingAIOutputSchema},
  tools: [wikiSearchTool],
  prompt: `You are an expert in Star Wars: Galaxy of Heroes (SWGOH). Your task is to identify units (characters OR ships) from the game that match a user's description. You must also understand and correctly interpret common SWGOH abbreviations (e.g., 'JML' for 'Jedi Master Luke Skywalker', 'AoE' for 'Area of Effect', 'TM' for 'Turn Meter', 'CD' for 'Critical Damage').

First, you must determine if the user is asking to build a squad or find individual units. A squad query usually involves terms like "team", "squad", "lineup", "beat", "counter", or asks for multiple characters to work together. If it is a squad query, set the 'isSquadQuery' flag to true and return an empty 'units' array.

If it is NOT a squad query, you MUST use information from two sources to provide the best possible answer:
1. Your built-in knowledge of swgoh.gg for unit URLs, icon URLs, and basic stats. This includes knowing the difference between character and ship pages (e.g., /characters/ vs /ships/).
2. The provided \`wikiSearch\` tool to get detailed, up-to-date information on abilities, strategies, and synergies from the wiki. The tool returns a list of search result snippets.

Crucially, you must understand the difference between Buffs (positive effects) and Debuffs (negative effects).
- **Buffs** are beneficial status effects. Examples include: Protection Up, Offense Up, Critical Damage Up, Speed Up, Tenacity Up, Retribution, Advantage.
- **Debuffs** are detrimental status effects. Examples include: Stun, Daze, Ability Block, Healing Immunity, Potency Down, Shock, Stagger, Target Lock, Fear.
When a user asks for units that apply buffs, DO NOT provide units that apply debuffs, and vice-versa.

You will identify {{{count}}} units from SWGOH that best match the user's characteristics.

{{#if loadMoreQuery}}
You MUST find different units than the ones you found for the previous query: "{{{loadMoreQuery}}}"
{{/if}}

For each unit, provide:
1. The unit's name.
2. The URL for the unit's small, public icon on swgoh.gg. These are usually square portraits.
3. The URL for the unit's page on swgoh.gg.
4. A concise, one-sentence description of how they satisfy the user's query. The description must be short and to the point.

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
      throw new Error('The AI model failed to generate a valid response. This could be due to a content filter or an internal error. Please try a different query.');
    }
    
    const anyOutput = output as any;
    const units = anyOutput.units || anyOutput.characters || [];
    const isSquadQuery = anyOutput.isSquadQuery || false;

    return { units, isSquadQuery };
  }
);

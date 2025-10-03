
'use server';

/**
 * @fileOverview A SWGOH squad building AI agent.
 *
 * - squadBuilderAI - A function that handles the squad building process.
 * - SquadBuilderAIInput - The input type for the squadBuilderAI function.
 * - SquadBuilderAIOutput - The return type for the squadBuilderAI function.
 */

import {ai} from '@/ai/genkit';
import { wikiSearchTool } from '@/ai/tools/wiki-search';
import {z} from 'genkit';
import { squadBuilderAIPrompt } from '@/ai/prompts';

const CharacterSchema = z.object({
  name: z.string().describe('The name of the character.'),
  imageUrl: z.string().describe("The URL of the character's icon."),
  url: z.string().url().describe("The URL of the character's page on swgoh.gg."),
});

const SquadSchema = z.object({
  description: z.string().describe('A brief, one-sentence description of the squad and its strategy.'),
  leader: CharacterSchema.describe('The leader of the squad.'),
  members: z.array(CharacterSchema).length(4).describe('The four other members of the squad.'),
  ally: CharacterSchema.optional().describe('A recommended ally to borrow for the 6th slot.'),
});

const SquadBuilderAIInputSchema = z.object({
  query: z.string().describe('The query describing the desired squad characteristics or goal.'),
  count: z.number().optional().default(2).describe('The number of squads to find.'),
  loadMoreQuery: z.string().optional().describe('An optional previous query to ensure new results are returned when loading more.'),
});
export type SquadBuilderAIInput = z.infer<typeof SquadBuilderAIInputSchema>;

const SquadBuilderAIOutputSchema = z.object({
  squads: z.array(SquadSchema).describe('A list of suggested squads.'),
  isUnitQuery: z.boolean().optional().describe('Set to true if the user\'s query is asking for individual units instead of building a squad.'),
});
export type SquadBuilderAIOutput = z.infer<typeof SquadBuilderAIOutputSchema>;


export async function squadBuilderAI(input: SquadBuilderAIInput): Promise<SquadBuilderAIOutput> {
  return squadBuilderAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'squadBuilderAIPrompt',
  prompt: squadBuilderAIPrompt,
  input: {schema: SquadBuilderAIInputSchema},
  output: {schema: SquadBuilderAIOutputSchema},
  tools: [wikiSearchTool],
  model: 'googleai/gemini-2.5-flash',
});

const squadBuilderAIFlow = ai.defineFlow(
  {
    name: 'squadBuilderAIFlow',
    inputSchema: SquadBuilderAIInputSchema,
    outputSchema: SquadBuilderAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a valid squad. This could be due to a content filter or an internal error. Please try a different query.');
    }

    // Gracefully handle cases where the model returns no squads array.
    const anyOutput = output as any;
    const squads = anyOutput.squads || [];
    const isUnitQuery = anyOutput.isUnitQuery || false;

    return { squads, isUnitQuery };
  }
);

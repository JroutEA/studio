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

const CharacterSchema = z.object({
  name: z.string().describe('The name of the character.'),
  imageUrl: z.string().describe("The URL of the character's icon."),
  url: z.string().url().describe("The URL of the character's page on swgoh.gg."),
});

const SquadSchema = z.object({
  name: z.string().describe('A name for the squad, e.g., "Classic Rebels" or "Sith Empire Trio".'),
  description: z.string().describe('A brief description of the squad and its strategy.'),
  leader: CharacterSchema.describe('The leader of the squad.'),
  members: z.array(CharacterSchema).length(4).describe('The four other members of the squad.'),
  ally: CharacterSchema.optional().describe('A recommended ally to borrow for the 6th slot.'),
});

const SquadBuilderAIInputSchema = z.object({
  query: z.string().describe('The query describing the desired squad characteristics or goal.'),
  count: z.number().optional().default(3).describe('The number of squads to find.'),
});
export type SquadBuilderAIInput = z.infer<typeof SquadBuilderAIInputSchema>;

const SquadBuilderAIOutputSchema = z.object({
  squads: z.array(SquadSchema).describe('A list of suggested squads.'),
});
export type SquadBuilderAIOutput = z.infer<typeof SquadBuilderAIOutputSchema>;


export async function squadBuilderAI(input: SquadBuilderAIInput): Promise<SquadBuilderAIOutput> {
  return squadBuilderAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'squadBuilderAIPrompt',
  input: {schema: SquadBuilderAIInputSchema},
  output: {schema: SquadBuilderAIOutputSchema},
  tools: [wikiSearchTool],
  prompt: `You are an expert in Star Wars: Galaxy of Heroes (SWGOH) squad building. Your task is to create effective squads based on a user's query.

You MUST use information from two sources to provide the best possible answer:
1.  Your built-in knowledge of swgoh.gg for character URLs, icon URLs, and team structures.
2.  The provided \`wikiSearch\` tool to get detailed, up-to-date information on ability synergies, strategies, and counter-play from swgoh.wiki.

A standard squad consists of 5 characters: 1 Leader and 4 Members. You will also suggest a 6th character as a borrowed Ally where appropriate.

You will suggest {{{count}}} squads that fit the user's query.

For each character, you MUST provide:
1. The character's name.
2. The URL for the character's small, public icon on swgoh.gg. These are usually square character portraits.
3. The URL for the character's page on swgoh.gg.

For each squad, you MUST provide:
1. A name for the squad.
2. A description of the squad's strategy and why it fits the query, synthesizing information from both swgoh.gg and your search results from the wiki.
3. The designated leader.
4. Exactly four members.
5. An optional recommended ally.

User Query: {{{query}}}`,
});

const squadBuilderAIFlow = ai.defineFlow(
  {
    name: 'squadBuilderAIFlow',
    inputSchema: SquadBuilderAIInputSchema,
    outputSchema: SquadBuilderAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

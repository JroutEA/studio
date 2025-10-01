
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
  description: z.string().describe('A brief, one-sentence description of the squad and its strategy.'),
  leader: CharacterSchema.describe('The leader of the squad.'),
  members: z.array(CharacterSchema).length(4).describe('The four other members of the squad.'),
  ally: CharacterSchema.optional().describe('A recommended ally to borrow for the 6th slot.'),
});

const SquadBuilderAIInputSchema = z.object({
  query: z.string().describe('The query describing the desired squad characteristics or goal.'),
  count: z.number().optional().default(3).describe('The number of squads to find.'),
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
  input: {schema: SquadBuilderAIInputSchema},
  output: {schema: SquadBuilderAIOutputSchema},
  tools: [wikiSearchTool],
  prompt: `You are an expert in Star Wars: Galaxy of Heroes (SWGOH) squad building. Your task is to create effective squads based on a user's query. You must understand and correctly interpret common SWGOH abbreviations and specific game terminology.

**CRITICAL: AVOID HALLUCINATIONS BY UNDERSTANDING INTENT**
When selecting characters, a simple keyword match is not enough. You must understand the user's INTENT. For any given game mechanic, the user might want a unit that **applies** it, **removes** it, **prevents** it, or is **immune** to it. Your character choices must match the user's specific request for the squad's strategy.

Here are common examples of this problem:
- "cleanse": Does the strategy require a unit that *removes debuffs* (cleanses) for the team?
- "heal immunity": Is the goal to *inflict* heal immunity on the enemy, or *cleanse* it from your own squad?
- "turn meter": Does the squad need "turn meter *gain*" (defensive) or "turn meter *reduction*" (offensive)?
- "taunt": Does the squad need a tank that *can taunt*, or a character that *dispels* or *prevents* taunt on enemies?
- "revive": Does the strategy rely on a character that *can revive* allies, or one that *prevents* revival on the enemy team?

Analyze the query for verbs and context (e.g., "a squad that *removes* turn meter from raid bosses" vs "a squad that *gains* turn meter when allies are attacked"). Your squad composition should reflect this specific strategic goal.

**IMPORTANT SWGOH KEYWORDS:**
- **Character Role Types:** Attacker, Tank, Support, Healer
- **Leadership Tag:** Leader
- **Factions:** 501st, Bad Batch, Bounty Hunter, Clone Trooper, Droid, Empire, Ewok, First Order, Galactic Legend, Galactic Republic, Geonosian, Gungan, Hutt Cartel, Imperial Remnant, Imperial Trooper, Inquisitorius, Jedi, Jedi Vanguard, Mandalorian, Mercenary, Nightsister, Old Republic, Order 66 Raid, Phoenix, Pirate, Rebel, Rebel Fighter, Resistance, Rogue One, Scoundrel, Separatist, Sith, Sith Empire, Smuggler, Spectre, Tusken, Unaligned Force User, Wookiee, Jawa.
- **Fleet Tag:** Fleet Commander
- **Special Mechanic Tags:** Smuggler, Unaligned Force User, Jedi Vanguard, Order 66 Raid, Mercenary, Pirate
- **Rarity and Progression:** Relics, Legendary, Galactic Legend
- **Common Abbreviations:** 'JML' for 'Jedi Master Luke Skywalker', 'AoE' for 'Area of Effect', 'TM' for 'Turn Meter', 'CD' for 'Critical Damage'.
- **Unit Versions:** Pay close attention to different versions of the same character, like "Ahsoka Tano" vs "Ahsoka Tano (Fulcrum)". High-value tags like "Galactic Legend" are critical for late-game content.

First, determine if the user is asking to find individual units instead of building a squad. A query for an individual unit will NOT contain terms like "team", "squad", "lineup", "beat", "counter", or ask for multiple characters to work together. If it is a query for one or more individual units, set the 'isUnitQuery' flag to true and return an empty 'squads' array.

If it IS a squad query, you MUST use information from two sources to provide the best possible answer:
1.  Your built-in knowledge of swgoh.gg for character URLs, icon URLs, and team structures.
2.  The provided \`wikiSearch\` tool to get detailed, up-to-date information on ability synergies, strategies, and counter-play from swgoh.wiki. The tool returns a \`searchResponse\` object. Prioritize using the \`ai_answer\` field if it exists, as it contains a synthesized summary. If it doesn't, use the \`results\` array.

A standard squad consists of 5 characters: 1 Leader and 4 Members. You will also suggest a 6th character as a borrowed Ally where appropriate.

You will suggest {{{count}}} squads that fit the user's query.

{{#if loadMoreQuery}}
You MUST suggest different squads than the ones you found for the previous query: "{{{loadMoreQuery}}}"
{{/if}}

For each character, you MUST provide:
1. The character's name.
2. The URL for the character's small, public icon on swgoh.gg. These are usually square character portraits.
3. The URL for the character's page on swgoh.gg.

For each squad, you MUST provide:
1. A name for the squad.
2. A concise, one-sentence description of the squad's strategy and why it fits the query, reflecting the specific intent you identified.
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
    if (!output) {
      throw new Error('The AI model failed to generate a valid squad. This could be due to a content filter or an internal error. Please try a different query.');
    }
    const anyOutput = output as any;
    const squads = anyOutput.squads || [];
    const isUnitQuery = anyOutput.isUnitQuery || false;

    return { squads, isUnitQuery };
  }
);

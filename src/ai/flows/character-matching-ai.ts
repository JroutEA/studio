
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
  prompt: `You are an expert in Star Wars: Galaxy of Heroes (SWGOH). Your task is to identify units (characters OR ships) from the game that match a user's description. You must understand and correctly interpret common SWGOH abbreviations and specific game terminology.

**CRITICAL: AVOID HALLUCINATIONS BY UNDERSTANDING INTENT**
A simple keyword match is not enough. You must understand the user's INTENT. For any given game mechanic, the user might want a unit that **applies** it, **removes** it, **prevents** it, or is **immune** to it. Your answer must match the user's specific request.

Here are common examples of this problem for both **characters and ships**:
- "cleanse": Does the user want a unit that *removes debuffs* (cleanses) or a unit that is merely mentioned in a cleanse-related ability?
- "heal immunity": Does the user want a unit that *inflicts* heal immunity, or one that *removes* it?
- "turn meter": Does the user want "turn meter *gain*" (defensive) or "turn meter *reduction*" (offensive)? Be specific. This applies to ships as well (e.g. gain on reinforcement).
- "taunt": Does the user want a unit that *can taunt*, or one that *dispels* or *prevents* taunt? For ships, this includes conditional taunts or taunts gained as a reinforcement bonus.
- "revive": Does the user want a unit that *can revive* allies, or one that *prevents* revival? For ships, this includes interactions like blocking or preventing revives.
- "assist": Does the user want a unit that *calls an assist*, or one that just benefits from them?
- "buff immunity": Does the user want a unit that *applies* buff immunity, or one that *cleanses* it?
- "dispel": Does the user want a unit that *can dispel* buffs, or one that is just immune to dispel or dispels on death?
- "stealth": Does the user want a unit that *grants stealth*, or one that *removes* or *ignores* stealth?
- "protection up": Does the user want a unit that *gives protection up*, or just one that gets it conditionally or on reinforcement?
- "counter": Does the user want a unit that *has a high counter chance*, or one that *prevents* counter attacks?
- "stagger": Does the user want a unit that *applies* Stagger, or one that *resists* or *cleanses* it?
- "daze": Does the user want a unit that *applies* Daze, or one that is immune to it?
- "buff" or "debuff": Is the user asking for a unit that *applies* a buff/debuff, or one that *copies*, *cleanses*, or *prevents* it?
- "cooldowns": Is the user asking for a unit that *reduces allied cooldowns*, or one that *increases enemy cooldowns*?
- **Ship-Specific Mechanics**: Be extra careful with Reinforcement effects, bonus turns, healing, and special damage types. A ship's kit might mention these as a passive or on-entry effect, not an active ability.

Analyze the query for verbs and context (e.g., "units that *give* turn meter" vs "units that *remove* turn meter"). If the intent is ambiguous, make a logical assumption and state it in your description (e.g., "This unit can apply Taunt, which was assumed from your query.").

**IMPORTANT SWGOH KEYWORDS:**
- **Character Role Types:** Attacker, Tank, Support, Healer
- **Leadership Tag:** Leader
- **Factions:** 501st, Bad Batch, Bounty Hunter, Clone Trooper, Droid, Empire, Ewok, First Order, Galactic Legend, Galactic Republic, Geonosian, Gungan, Hutt Cartel, Imperial Remnant, Imperial Trooper, Inquisitorius, Jedi, Jedi Vanguard, Mandalorian, Mercenary, Nightsister, Old Republic, Order 66 Raid, Phoenix, Pirate, Rebel, Rebel Fighter, Resistance, Rogue One, Scoundrel, Separatist, Sith, Sith Empire, Smuggler, Spectre, Tusken, Unaligned Force User, Wookiee, Jawa.
- **Fleet Tag:** Fleet Commander
- **Special Mechanic Tags:** Smuggler, Unaligned Force User, Jedi Vanguard, Order 66 Raid, Mercenary, Pirate
- **Rarity and Progression:** Relics, Legendary, Galactic Legend
- **Common Abbreviations:** 'JML' for 'Jedi Master Luke Skywalker', 'AoE' for 'Area of Effect', 'TM' for 'Turn Meter', 'CD' for 'Critical Damage'.

First, you must determine if the user is asking to build a squad or find individual units. A squad query usually involves terms like "team", "squad", "lineup", "beat", "counter", or asks for multiple characters to work together. If it is a squad query, set the 'isSquadQuery' flag to true and return an empty 'units' array.

If it is NOT a squad query, you MUST use information from two sources to provide the best possible answer:
1. The provided \`wikiSearch\` tool to get detailed, up-to-date information on abilities, strategies, and synergies from the wiki. The tool returns a \`searchResponse\` object. Prioritize using the \`ai_answer\` field if it exists, as it contains a synthesized summary. If it doesn't, use the \`results\` array.
2. Your built-in knowledge of swgoh.gg for unit icon URLs.

**CRITICAL: GETTING UNIT NAMES AND URLS CORRECT**
You MUST NOT invent or guess character names or swgoh.gg URLs. Your internal knowledge may be out of date.
- The name of a unit MUST be exactly as it appears in the game. For example, "Anakin Skywalker" is incorrect. The correct name is "Jedi Knight Anakin".
- The URL for a unit MUST be taken from the \`wikiSearch\` tool results or be constructed from the precise, correct unit name. Do not guess.
- Pay close attention to different versions of the same character, like "Ahsoka Tano" vs "Ahsoka Tano (Fulcrum)". High-value tags like "Galactic Legend" are critical for late-game content.

Crucially, you must understand the difference between Buffs (positive effects) and Debuffs (negative effects).
- **Buffs** are beneficial status effects. Examples include: Protection Up, Offense Up, Critical Damage Up, Speed Up, Tenacity Up, Retribution, Advantage.
- **Debuffs** are detrimental status effects. Examples include: Stun, Daze, Ability Block, Healing Immunity, Potency Down, Shock, Stagger, Target Lock, Fear.
When a user asks for units that apply buffs, DO NOT provide units that apply debuffs, and vice-versa.

You will identify {{{count}}} units from SWGOH that best match the user's characteristics.

{{#if loadMoreQuery}}
You MUST find different units than the ones you found for the previous query: "{{{loadMoreQuery}}}"
{{/if}}

For each unit, provide:
1. The unit's correct and full name.
2. The URL for the unit's small, public icon on swgoh.gg. These are usually square portraits.
3. The URL for the unit's page on swgoh.gg.
4. A concise, one-sentence description of how they satisfy the user's query, clarifying the specific action (e.g., "Applies Taunt to self," "Removes all debuffs from allies"). The description must be short and to the point.

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
    
    // Gracefully handle cases where the model returns 'characters' instead of 'units' or nothing at all
    const anyOutput = output as any;
    const units = anyOutput.units || anyOutput.characters || [];
    const isSquadQuery = anyOutput.isSquadQuery || false;

    return { units, isSquadQuery };
  }
);

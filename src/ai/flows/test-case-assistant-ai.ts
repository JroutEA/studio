
'use server';

/**
 * @fileOverview An AI agent for generating SWGOH test cases.
 *
 * - testCaseAssistantAI - A function that handles the test case generation process.
 * - TestCaseAssistantAIInput - The input type for the testCaseAssistantAI function.
 * - TestCaseAssistantAIOutput - The return type for the testCaseAssistantAI function.
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
    name: z.string().describe('A name for the squad, e.g., "Test Allies" or "Opponent Squad".'),
    leader: CharacterSchema.describe('The leader of the squad.'),
    members: z.array(CharacterSchema).max(4).describe('The other members of the squad.'),
});

const TestCaseAssistantAIInputSchema = z.object({
  unitDetails: z.string().describe("All details of the new unit's abilities, conditions, buffs, debuffs, zeta, and omicrons."),
  testCase: z.string().describe('The ability or feature that is under test.'),
  expectedResult: z.string().describe('The expected outcome of the test case.'),
});
export type TestCaseAssistantAIInput = z.infer<typeof TestCaseAssistantAIInputSchema>;

const TestCaseAssistantAIOutputSchema = z.object({
  scenarioTitle: z.string().describe('A descriptive title for the test scenario.'),
  scenarioDescription: z.string().describe('A brief overview of the test scenario and its goal.'),
  alliedSquad: SquadSchema.describe('The squad to be used by the player/tester, including the new unit.'),
  opponentSquad: SquadSchema.describe('The squad the player will face. This squad should be specifically chosen to allow the test conditions to be met.'),
  setupInstructions: z.array(z.string()).describe('A step-by-step guide on how to set up the battle to perform the test.'),
  passCriteria: z.string().describe('The specific, observable outcome that determines if the test case has passed.'),
  failCriteria: z.string().describe('The specific, observable outcome that determines if the test case has failed.'),
  notApplicableCriteria: z.string().optional().describe('Conditions under which the test would be considered not applicable or invalid.'),
});
export type TestCaseAssistantAIOutput = z.infer<typeof TestCaseAssistantAIOutputSchema>;

export async function testCaseAssistantAI(input: TestCaseAssistantAIInput): Promise<TestCaseAssistantAIOutput> {
  return testCaseAssistantAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'testCaseAssistantAIPrompt',
  input: {schema: TestCaseAssistantAIInputSchema},
  output: {schema: TestCaseAssistantAIOutputSchema},
  tools: [wikiSearchTool],
  prompt: `You are a Senior QA Tester and expert in Star Wars: Galaxy of Heroes (SWGOH). Your task is to create a detailed test scenario based on a new unit's abilities and an expected test result. You must have a deep understanding of SWGOH mechanics, terminology, and character kits.

**CRITICAL: SELECTING THE CORRECT OPPONENTS**
When choosing the **opponentSquad**, you must select characters that create the specific conditions required for the test. A simple keyword match is not enough. You must understand the *interaction* being tested.

- To test an **anti-revive** mechanic, the opponent squad MUST include a character that **can revive** (e.g., Mother Talzin, Daka).
- To test an **anti-evasion** ability, the opponents MUST be characters known for **high Evasion** (e.g., Jedi Master Kenobi, Luminara Unduli).
- To test an ability that **dispels taunt**, the opponent squad MUST have a character that **can taunt** (e.g., Sun Fac, General Kenobi).
- To test an ability that **inflicts heal immunity**, the opponent squad should ideally have a **healer** to confirm that healing is blocked (e.g., Barriss Offee).
- To test an ability that *reduces cooldowns*, the opponent might need to have long cooldowns or abilities that can be reset.
- To test an ability that *prevents stealth*, the opponent squad should have characters that can *grant or gain stealth*.

Your primary goal is to pick opponents that allow the new unit's ability to be triggered and its outcome to be clearly observed.

**IMPORTANT SWGOH KEYWORDS for Character Selection:**
- **Character Role Types:** Attacker, Tank, Support, Healer
- **Leadership Tag:** Leader
- **Factions:** 501st, Bad Batch, Bounty Hunter, Clone Trooper, Droid, Empire, Ewok, First Order, Galactic Legend, Galactic Republic, Geonosian, Gungan, Hutt Cartel, Imperial Remnant, Imperial Trooper, Inquisitorius, Jedi, Jedi Vanguard, Mandalorian, Mercenary, Nightsister, Old Republic, Order 66 Raid, Phoenix, Pirate, Rebel, Rebel Fighter, Resistance, Rogue One, Scoundrel, Separatist, Sith, Sith Empire, Smuggler, Spectre, Tusken, Unaligned Force User, Wookiee, Jawa.
- **Fleet Tag:** Fleet Commander
- **Special Mechanic Tags:** Smuggler, Unaligned Force User, Jedi Vanguard, Order 66 Raid, Mercenary, Pirate
- **Rarity and Progression:** Relics, Legendary, Galactic Legend
- **Common Abbreviations:** 'JML' for 'Jedi Master Luke Skywalker', 'AoE' for 'Area of Effect', 'TM' for 'Turn Meter', 'CD' for 'Critical Damage'.

First, you must thoroughly analyze the user's input:
1.  **New Unit Details**: {{{unitDetails}}}
2.  **Test Case / Ability Under Test**: {{{testCase}}}
3.  **Expected Result**: {{{expectedResult}}}

Next, you MUST use your deep knowledge of SWGOH by combining information from two sources to design the test:
1.  The provided \`wikiSearch\` tool to get detailed, up-to-date information on existing character kits, buffs, debuffs, and game mechanics from swgoh.wiki. The tool returns a \`searchResponse\` object. Prioritize using the \`ai_answer\` field if it exists, as it contains a synthesized summary. If it doesn't, use the \`results\` array to find the information you need.
2.  Your built-in knowledge of swgoh.gg for character icon URLs and team structures.

**CRITICAL: GETTING UNIT NAMES AND URLS CORRECT**
You MUST NOT invent or guess character names or swgoh.gg URLs. Your internal knowledge may be out of date.
- The name of a unit MUST be exactly as it appears in the game. For example, "Anakin Skywalker" is incorrect. The correct name is "Jedi Knight Anakin".
- The URL for a unit MUST be taken from the \`wikiSearch\` tool results or be constructed from the precise, correct unit name. Do not guess.
- Pay close attention to different versions of the same character, like "Ahsoka Tano" vs "Ahsoka Tano (Fulcrum)".

Based on your analysis, you will generate a complete test scenario.

Your output MUST include:
1.  **scenarioTitle**: A clear, concise title for this test.
2.  **scenarioDescription**: An explanation of what this scenario is designed to test and why it's set up the way it is. This should reference your search results from the wiki to justify your choices.
3.  **alliedSquad**: A squad for the player. This squad should include the new unit under test (you can use a placeholder for its name and icon if it's new) and other characters that enable the test condition.
4.  **opponentSquad**: A squad for the AI opponent, specifically chosen to facilitate the test.
5.  **setupInstructions**: A numbered, step-by-step list of actions the tester needs to take in the battle to create the exact conditions for the test. e.g., "1. Use Character X's second special ability on Opponent Y. 2. Wait for Opponent Z to take a turn and apply a buff."
6.  **passCriteria**: A clear, binary, and observable outcome. What must happen for the test to be marked as "PASS"?
7.  **failCriteria**: A clear, binary, and observable outcome. What must happen for the test to be marked as "FAIL"?
8.  **notApplicableCriteria**: An optional field for conditions that would make the test result invalid (e.g., "The opponent is defeated before the ability can be used.").

For all characters in the allied and opponent squads, you MUST provide:
- The character's correct and full name.
- The URL for the character's small, public icon on swgoh.gg.
- The URL for the character's page on swgoh.gg.

For the new unit under test, use "New Unit" as the name, and use a placeholder icon URL: 'https://placehold.co/80x80/000000/FFFFFF/png?text=NEW'.`,
});

const testCaseAssistantAIFlow = ai.defineFlow(
  {
    name: 'testCaseAssistantAIFlow',
    inputSchema: TestCaseAssistantAIInputSchema,
    outputSchema: TestCaseAssistantAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to generate a valid test case. This could be due to a model content filtering or an internal error. Please try modifying your input or try again later.');
    }
    return output;
  }
);

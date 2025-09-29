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
  testCase: z.string().describe('The ability or feature that is under test.'),
  unitDetails: z.string().describe("All details of the new unit's abilities, conditions, buffs, debuffs, zeta, and omicrons."),
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
  try {
    return await testCaseAssistantAIFlow(input);
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    if (errorMessage.includes('503 Service Unavailable')) {
      throw new Error("The AI model is temporarily unavailable (503 Service Unavailable). This is usually a temporary issue. Please try again in a few moments.");
    }
    // Re-throw other errors
    throw e;
  }
}

const prompt = ai.definePrompt({
  name: 'testCaseAssistantAIPrompt',
  input: {schema: TestCaseAssistantAIInputSchema},
  output: {schema: TestCaseAssistantAIOutputSchema},
  tools: [wikiSearchTool],
  prompt: `You are a Senior QA Tester and expert in Star Wars: Galaxy of Heroes (SWGOH). Your task is to create a detailed test scenario based on a new unit's abilities and an expected test result. You must also understand and correctly interpret common SWGOH abbreviations (e.g., 'JML' for 'Jedi Master Luke Skywalker', 'AoE' for 'Area of Effect', 'TM' for 'Turn Meter', 'CD' for 'Critical Damage').

First, you must thoroughly analyze the user's input:
1.  **Test Case / Ability Under Test**: {{{testCase}}}
2.  **New Unit Details**: {{{unitDetails}}}
3.  **Expected Result**: {{{expectedResult}}}

Next, you MUST use your deep knowledge of SWGOH by combining information from two sources to design the test:
1.  Your built-in knowledge of swgoh.gg for character URLs, icon URLs, and team structures.
2.  The provided \`wikiSearch\` tool to get detailed, up-to-date information on existing character kits, buffs, debuffs, and game mechanics from swgoh.wiki that are relevant to the test conditions.

Based on your analysis, you will generate a complete test scenario.

Your output MUST include:
1.  **scenarioTitle**: A clear, concise title for this test.
2.  **scenarioDescription**: An explanation of what this scenario is designed to test and why it's set up the way it is. This should reference your search results from the wiki to justify your choices.
3.  **alliedSquad**: A squad for the player. This squad should include the new unit under test (you can use a placeholder for its name and icon if it's new) and other characters that enable the test condition.
4.  **opponentSquad**: A squad for the AI opponent. This is critical. The opponents must be chosen specifically to facilitate the test, based on your wiki research. For example, if testing an anti-evasion ability, the opponents should be characters known for high Evasion Up.
5.  **setupInstructions**: A numbered, step-by-step list of actions the tester needs to take in the battle to create the exact conditions for the test. e.g., "1. Use Character X's second special ability on Opponent Y. 2. Wait for Opponent Z to take a turn and apply a buff."
6.  **passCriteria**: A clear, binary, and observable outcome. What must happen for the test to be marked as "PASS"?
7.  **failCriteria**: A clear, binary, and observable outcome. What must happen for the test to be marked as "FAIL"?
8.  **notApplicableCriteria**: An optional field for conditions that would make the test result invalid (e.g., "The opponent is defeated before the ability can be used.").

For all characters in the allied and opponent squads, you MUST provide:
- The character's name.
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

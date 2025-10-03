
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
import { testCaseAssistantAIPrompt } from '@/ai/prompts';


const CharacterSchema = z.object({
  name: z.string().describe('The name of the character.'),
});

const SquadSchema = z.object({
    name: z.string().describe('A name for the squad, e.g., "Test Allies" or "Opponent Squad".'),
    leader: CharacterSchema.describe('The leader of the squad.'),
    members: z.array(CharacterSchema).describe('The other members of the squad. Should ideally be 4 members, but can vary.'),
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
  alliedSquad: SquadSchema.describe('The squad to be used by the player/tester, including the new unit. This squad MUST have a designated leader and 4 other members.'),
  opponentSquad: SquadSchema.describe('The squad the player will face. This squad should be specifically chosen to allow the test conditions to be met. This squad MUST have a designated leader and 4 other members.'),
  setupInstructions: z.array(z.string()).describe('A step-by-step guide on how to set up the battle to perform the test. Each step should be a plain string without any numbering.'),
});
export type TestCaseAssistantAIOutput = z.infer<typeof TestCaseAssistantAIOutputSchema>;

export async function testCaseAssistantAI(input: TestCaseAssistantAIInput): Promise<TestCaseAssistantAIOutput> {
  return testCaseAssistantAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'testCaseAssistantAIPrompt',
  prompt: testCaseAssistantAIPrompt,
  input: {schema: TestCaseAssistantAIInputSchema},
  output: {schema: TestCaseAssistantAIOutputSchema},
  tools: [wikiSearchTool],
  model: 'openai:gpt-4o',
});

const testCaseAssistantAIFlow = ai.defineFlow(
  {
    name: 'testCaseAssistantAIFlow',
    inputSchema: TestCaseAssistantAIInputSchema,
    outputSchema: TestCaseAssistantAIOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error('The AI model returned no output. This may be due to a content filter or an internal error.');
    }
    
    // Advanced Repair Logic to handle common AI inconsistencies.
    const repairedOutput = { ...output } as any;

    // 1. Ensure squads are objects and have required fields
    for (const squadKey of ['alliedSquad', 'opponentSquad']) {
      if (typeof repairedOutput[squadKey] !== 'object' || repairedOutput[squadKey] === null) {
        repairedOutput[squadKey] = {};
      }
      const squad = repairedOutput[squadKey];
      if (!squad.name) squad.name = squadKey === 'alliedSquad' ? 'Allied Squad' : 'Opponent Squad';
      if (typeof squad.leader !== 'object' || squad.leader === null) {
        squad.leader = { name: squadKey === 'alliedSquad' ? 'New Unit' : 'Unknown' };
      }
      if (!Array.isArray(squad.members)) {
        squad.members = [];
      }
    }

    // 2. Ensure setupInstructions is an array of strings
    if (!Array.isArray(repairedOutput.setupInstructions)) {
      repairedOutput.setupInstructions = [];
    } else {
      // Filter out any non-string elements just in case
      repairedOutput.setupInstructions = repairedOutput.setupInstructions.filter((i: any) => typeof i === 'string');
    }

    // 3. Ensure required string fields are present and not empty
    const requiredStrings = ['scenarioTitle', 'scenarioDescription'];
    for (const key of requiredStrings) {
      if (typeof repairedOutput[key] !== 'string' || !repairedOutput[key]) {
        repairedOutput[key] = `No ${key} provided.`;
      }
    }

    // The final validated output will be returned by the flow.
    // If it still fails, the error will be more specific.
    return repairedOutput as TestCaseAssistantAIOutput;
  }
);

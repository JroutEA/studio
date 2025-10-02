
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
  imageUrl: z.string().describe("The URL of the character's icon."),
  url: z.string().url().describe("The URL of the character's page on swgoh.gg."),
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
  prompt: testCaseAssistantAIPrompt,
  input: {schema: TestCaseAssistantAIInputSchema},
  output: {schema: TestCaseAssistantAIOutputSchema},
  tools: [wikiSearchTool],
});

const testCaseAssistantAIFlow = ai.defineFlow(
  {
    name: 'testCaseAssistantAIFlow',
    inputSchema: TestCaseAssistantAIInputSchema,
    outputSchema: TestCaseAssistantAIOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('The AI model returned no output. This may be due to a content filter or an internal error.');
      }
      
      // Repair logic to ensure schema is met
      const repairedOutput = {...output};

      // Ensure squads exist
      if (!repairedOutput.alliedSquad) {
        repairedOutput.alliedSquad = { name: 'Allied Squad', leader: { name: 'New Unit', imageUrl: 'https://placehold.co/80x80/000000/FFFFFF/png?text=NEW', url: '#' }, members: [] };
      }
      if (!repairedOutput.opponentSquad) {
        repairedOutput.opponentSquad = { name: 'Opponent Squad', leader: { name: 'Unknown', imageUrl: '', url: '#' }, members: [] };
      }
      
      // Ensure members arrays exist
      if (!repairedOutput.alliedSquad.members) {
        repairedOutput.alliedSquad.members = [];
      }
      if (!repairedOutput.opponentSquad.members) {
        repairedOutput.opponentSquad.members = [];
      }

      // Ensure instructions array exists
      if (!repairedOutput.setupInstructions) {
        repairedOutput.setupInstructions = [];
      }

      // Ensure required string fields are not empty
      if (!repairedOutput.scenarioTitle) repairedOutput.scenarioTitle = "Untitled Test Scenario";
      if (!repairedOutput.scenarioDescription) repairedOutput.scenarioDescription = "No description provided.";
      if (!repairedOutput.passCriteria) repairedOutput.passCriteria = "Not specified.";
      if (!repairedOutput.failCriteria) repairedOutput.failCriteria = "Not specified.";

      return repairedOutput;
    } catch (e: unknown) {
      // Re-throw the original error if it's not a simple validation issue
      // This helps in debugging if the error is from the model/API itself
      throw e;
    }
  }
);

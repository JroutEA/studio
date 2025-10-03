
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
import { squadBuilderAIPrompt as promptTemplate } from '@/ai/prompts';


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

// Define the fallback order for the models.
const models: string[] = ['openai:gpt-4o-mini'];

export async function squadBuilderAI(input: SquadBuilderAIInput): Promise<SquadBuilderAIOutput> {
    let lastError: any;
    
    // Manually template the prompt string
    let prompt = promptTemplate.replace('{{{count}}}', String(input.count));
    prompt = prompt.replace('{{{query}}}', input.query);
    if (input.loadMoreQuery) {
        prompt = prompt.replace('{{#if loadMoreQuery}}', '');
        prompt = prompt.replace('{{{loadMoreQuery}}}', input.loadMoreQuery);
        prompt = prompt.replace('{{/if}}', '');
    } else {
        prompt = prompt.replace(/{{#if loadMoreQuery}}[\s\S]*?{{\/if}}/, '');
    }

    for (const model of models) {
        try {
            console.log(`Attempting to generate with model: ${model}`);
            const response = await ai.generate({
                model,
                prompt,
                output: {
                    schema: SquadBuilderAIOutputSchema,
                },
                tools: [wikiSearchTool],
            });

            const output = response.output();
            if (!output) {
                throw new Error('No output generated.');
            }

            console.log(`Successfully generated with model: ${model}`);

            // Gracefully handle cases where the model returns no squads array.
            const anyOutput = output as any;
            const squads = anyOutput.squads || [];
            const isUnitQuery = anyOutput.isUnitQuery || false;

            return { squads, isUnitQuery };

        } catch (err) {
            console.error(`Model ${model} failed:`, err);
            lastError = err;
        }
    }

    console.error('All models failed to generate a response.');
    throw lastError || new Error('The AI model failed to generate a valid squad. This could be due to a content filter or an internal error. Please try a different query.');
}

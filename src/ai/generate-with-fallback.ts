
'use server';

import { GenerateRequest, PromptAction } from 'genkit';

// Define the fallback order for the models.
const models: string[] = ['openai:gpt-4o', 'openai:gpt-4o-mini', 'openai:gpt-4-turbo'];

/**
 * Generates a response using a series of fallback models.
 * It will try the models in the predefined order and return the first successful response.
 * If all models fail, it will throw the last encountered error.
 *
 * @param prompt The Genkit prompt action to execute.
 * @param input The input to pass to the prompt.
 * @returns The successful generation response.
 * @throws An error if all models fail.
 */
export async function generateWithFallback<I, O>(
    prompt: PromptAction<I, O>,
    input: I
): Promise<any> {
  let lastError: any;

  for (const model of models) {
    try {
      console.log(`Attempting to generate with model: ${model}`);
      // The `generate()` method on a prompt object allows overriding the model
      const response = await prompt.generate({
        model,
        input,
      });
      console.log(`Successfully generated with model: ${model}`);
      return response;
    } catch (err) {
      console.error(`Model ${model} failed:`, err);
      lastError = err;
    }
  }

  console.error('All models failed to generate a response.');
  throw lastError;
}

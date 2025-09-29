'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getJson } from 'serpapi';

export const wikiSearchTool = ai.defineTool(
  {
    name: 'wikiSearch',
    description: 'Searches the swgoh.wiki site for relevant pages and returns the content.',
    inputSchema: z.object({
      query: z.string().describe('The search query for the wiki.'),
    }),
    outputSchema: z.object({
      results: z.array(
        z.object({
          title: z.string(),
          link: z.string().url(),
          snippet: z.string(),
        })
      ),
    }),
  },
  async (input) => {
    console.log(`Performing wiki search for: ${input.query}`);
    if (!process.env.SERPAPI_KEY) {
      console.error('SERPAPI_KEY environment variable not set.');
      // Return empty result to AI instead of throwing to allow flow to continue
      return { results: [] };
    }

    try {
      const response = await getJson({
        engine: 'google',
        q: `site:swgoh.wiki ${input.query}`,
        api_key: process.env.SERPAPI_KEY,
      });
      
      const organicResults = response.organic_results || [];
      
      const results = organicResults.slice(0, 5).map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      }));

      console.log(`Wiki search returned ${results.length} results.`);
      return { results };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error performing wiki search:', errorMessage);
      // Return an empty result to the AI instead of throwing, so the flow can continue.
      return { results: [] };
    }
  }
);

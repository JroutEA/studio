'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getJson } from 'google-search-results-nodejs';

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
    try {
      const response = await new Promise((resolve, reject) => {
        getJson(
          {
            engine: 'google',
            api_key: process.env.SERPAPI_KEY,
            q: input.query,
            site: 'swgoh.wiki',
          },
          (json) => {
            resolve(json);
          }
        );
      });

      const organicResults = (response as any).organic_results || [];
      
      const results = organicResults.slice(0, 5).map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      }));

      console.log(`Wiki search returned ${results.length} results.`);
      return { results };
    } catch (error) {
      console.error('Error performing wiki search:', error);
      return { results: [] };
    }
  }
);

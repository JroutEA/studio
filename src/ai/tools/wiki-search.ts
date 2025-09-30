'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getJson } from 'serpapi';

const SearchResultSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  snippet: z.string().optional(),
});

export const wikiSearchTool = ai.defineTool(
  {
    name: 'wikiSearch',
    description: 'Searches the swgoh.wiki site for relevant pages and returns a synthesized answer and source content.',
    inputSchema: z.object({
      query: z.string().describe('The search query for the wiki.'),
    }),
    outputSchema: z.object({
      searchResponse: z.object({
        ai_answer: z.string().optional().describe("A direct, synthesized answer to the query based on search results. Use this as the primary source of information if available."),
        results: z.array(SearchResultSchema).describe("A list of search results with titles, links, and snippets. Use this as a fallback if 'ai_answer' is not present."),
      })
    }),
  },
  async (input) => {
    console.log(`Performing wiki search for: ${input.query}`);
    if (!process.env.SERPAPI_KEY) {
      console.error('SERPAPI_KEY environment variable not set.');
      // Return empty result to AI instead of throwing to allow flow to continue
      return { searchResponse: { results: [] } };
    }

    try {
      const response = await getJson({
        engine: 'google_ai',
        q: `site:swgoh.wiki ${input.query}`,
        api_key: process.env.SERPAPI_KEY,
      });
      
      const aiAnswer = response.ai_answer?.answer;
      const organicResults = response.organic_results || [];
      
      const results = organicResults.slice(0, 5).map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      }));

      const searchResponse = {
        ai_answer: aiAnswer,
        results: results,
      }

      console.log(`Wiki search returned. AI Answer present: ${!!aiAnswer}`);
      return { searchResponse };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error performing wiki search:', errorMessage);
      // Return an empty result to the AI instead of throwing, so the flow can continue.
      return { searchResponse: { results: [] } };
    }
  }
);

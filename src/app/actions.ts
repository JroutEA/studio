
'use server';

import { z } from 'zod';
import {
  unitMatchingAI,
  type UnitMatchingAIOutput,
  type UnitMatchingAIInput,
} from '@/ai/flows/character-matching-ai';
import {
  squadBuilderAI,
  type SquadBuilderAIOutput,
  type SquadBuilderAIInput,
} from '@/ai/flows/squad-builder-ai';
import {
  testCaseAssistantAI,
  type TestCaseAssistantAIOutput,
  type TestCaseAssistantAIInput,
} from '@/ai/flows/test-case-assistant-ai';

import { unitMatchingAIPrompt, squadBuilderAIPrompt, testCaseAssistantAIPrompt } from '@/ai/prompts';


export type FormState = {
  message: string;
  units?: UnitMatchingAIOutput['units'];
  squads?: SquadBuilderAIOutput['squads'];
  testCase?: TestCaseAssistantAIOutput;
  query?: string;
  squadsInput?: SquadBuilderAIInput;
  testCaseInput?: TestCaseAssistantAIInput;
  switchToTab?: string;
  fallbackPrompt?: string;
};

const findUnitsSchema = z.object({
  query: z.string().min(5, { message: 'Query must be at least 5 characters long.' }),
  loadMoreQuery: z.string().optional(),
  count: z.coerce.number().optional().default(10),
});

const buildSquadSchema = z.object({
  query: z.string().min(10, { message: 'Query must be at least 10 characters long.' }),
  loadMoreQuery: z.string().optional(),
  count: z.coerce.number().optional().default(3),
});

const generateTestCaseSchema = z.object({
    testCase: z.string().min(10, { message: 'Test case description must be at least 10 characters.' }),
    unitDetails: z.string().min(20, { message: 'Unit details must be at least 20 characters.' }),
    expectedResult: z.string().min(10, { message: 'Expected result must be at least 10 characters.' }),
});

function generatePrompt(basePrompt: string, data: Record<string, any>): string {
    return basePrompt.replace(/{{{\s*(\w+)\s*}}}/g, (match, key) => {
        return data[key] || '';
    }).replace(/{{#if (\w+)\s*}}([\s\S]*?){{\/if}}/g, (match, key, content) => {
        return data[key] ? content : '';
    });
}

export async function findUnits(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = findUnitsSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid query.',
      units: prevState.units || [],
    };
  }
  
  const { query, loadMoreQuery, count } = validatedFields.data;
  const isLoadMore = !!loadMoreQuery;
  const input: UnitMatchingAIInput = { query, count, loadMoreQuery };

  try {
    const result = await unitMatchingAI(input);

    if (result.isSquadQuery) {
        const squadResult = await squadBuilderAI({ query, count: 3 });
        return {
            message: 'success',
            query: query,
            units: [], // Clear units
            squads: squadResult.squads, // Populate squads
            switchToTab: 'squad-builder',
        };
    }
    
    if (!result.units || result.units.length === 0) {
      return { 
        ...prevState,
        message: 'No new units found.',
        query: query
      };
    }

    const combinedUnits = isLoadMore 
      ? [...(prevState.units || []), ...result.units]
      : result.units;

    // Filter out duplicates based on name
    const uniqueUnits = Array.from(new Map(combinedUnits.map(unit => [unit.name, unit])).values());

    return { 
      message: 'success', 
      units: uniqueUnits,
      query: query
    };

  } catch (e: unknown) {
    let errorMessage = e instanceof Error ? e.message : String(e);
    if (errorMessage.includes('503')) {
       errorMessage = "The AI model is temporarily unavailable (503 Service Unavailable). Please try again in a few moments.";
    }
    if (errorMessage.includes('Schema validation failed')) {
      errorMessage = "The AI model returned an invalid response. This may be due to content filtering or a temporary issue. Please try a different query.";
    }

    const fallbackPrompt = generatePrompt(unitMatchingAIPrompt, input);
    
    return { ...prevState, query, message: `An error occurred: ${errorMessage}`, fallbackPrompt };
  }
}

export async function buildSquad(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = buildSquadSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid query.',
      squads: prevState.squads || [],
    };
  }

  const { query, loadMoreQuery, count } = validatedFields.data;
  const isLoadMore = !!loadMoreQuery;
  const input: SquadBuilderAIInput = { query, count, loadMoreQuery };

  try {
    const result = await squadBuilderAI(input);

    if (result.isUnitQuery) {
        const unitResult = await unitMatchingAI({ query, count: 10 });
        return {
            message: 'success',
            squadsInput: { query },
            squads: [], // Clear squads
            units: unitResult.units, // Populate units
            switchToTab: 'unit-finder',
        };
    }

     if (!result.squads || result.squads.length === 0) {
      return { 
        ...prevState,
        message: 'No new squads found.',
        squadsInput: { query }
      };
    }

    const combinedSquads = isLoadMore
        ? [...(prevState.squads || []), ...result.squads]
        : result.squads;

    // Filter out duplicates based on squad name
    const uniqueSquads = Array.from(new Map(combinedSquads.map(squad => [squad.name, squad])).values());

    return { 
      message: 'success',
      squads: uniqueSquads,
      squadsInput: { query }
    };
  } catch (e: unknown) {
    let errorMessage = e instanceof Error ? e.message : String(e);
     if (errorMessage.includes('503')) {
       errorMessage = "The AI model is temporarily unavailable (503 Service Unavailable). Please try again in a few moments.";
    }
    if (errorMessage.includes('Schema validation failed')) {
      errorMessage = "The AI model returned an invalid response. This may be due to content filtering or a temporary issue. Please try a different query.";
    }
    const fallbackPrompt = generatePrompt(squadBuilderAIPrompt, input);

    return { ...prevState, squadsInput: { query }, message: `An error occurred while building the squad: ${errorMessage}`, fallbackPrompt };
  }
}

export async function generateTestCase(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const validatedFields = generateTestCaseSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.flatten().fieldErrors.testCase?.[0] || 
                     validatedFields.error.flatten().fieldErrors.unitDetails?.[0] || 
                     validatedFields.error.flatten().fieldErrors.expectedResult?.[0] || 
                     "Invalid input.",
        };
    }
    
    const input: TestCaseAssistantAIInput = validatedFields.data;

    try {
        const result = await testCaseAssistantAI(input);
        return {
            message: 'success',
            testCase: result,
            testCaseInput: input
        };
    } catch (e: unknown) {
        let errorMessage = e instanceof Error ? e.message : String(e);
        if (errorMessage.includes('503')) {
          errorMessage = "The AI model is temporarily unavailable (503 Service Unavailable). Please try again in a few moments.";
        }
        if (errorMessage.includes('Schema validation failed')) {
          errorMessage = "The AI model returned an invalid response. This may be due to content filtering or a temporary issue. Please try a different query.";
        }
        const fallbackPrompt = generatePrompt(testCaseAssistantAIPrompt, input);
        return { ...prevState, testCaseInput: input, message: `An error occurred: ${errorMessage}`, fallbackPrompt };
    }
}

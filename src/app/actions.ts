
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
  count: z.coerce.number().optional().default(6),
});

const buildSquadSchema = z.object({
  query: z.string().min(10, { message: 'Query must be at least 10 characters long.' }),
  loadMoreQuery: z.string().optional(),
  count: z.coerce.number().optional().default(1),
});

const generateTestCaseSchema = z.object({
    testCase: z.string().min(10, { message: 'Test case description must be at least 10 characters.' }),
    unitDetails: z.string().min(20, { message: 'Unit details must be at least 20 characters.' }),
    expectedResult: z.string().min(10, { message: 'Expected result must be at least 10 characters.' }),
});

function generatePromptFromTemplate(template: string, replacements: Record<string, string | number | undefined>): string {
    let prompt = template;
    for (const key in replacements) {
        const value = replacements[key];
        // Handle simple replacement
        prompt = prompt.replace(new RegExp(`{{{${key}}}}`, 'g'), String(value || ''));

        // Handle conditional block
        const conditionalRegex = new RegExp(`{{#if ${key}}}([\\s\\S]*?){{\\/if}}`, 'g');
        if (value) {
            prompt = prompt.replace(conditionalRegex, '$1');
        } else {
            prompt = prompt.replace(conditionalRegex, '');
        }
    }
    return prompt;
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
    const errorMessage = e instanceof Error ? e.message : String(e);
    const fallbackPrompt = generatePromptFromTemplate(unitMatchingAIPrompt, { count, query, loadMoreQuery });
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
        const unitResult = await unitMatchingAI({ query, count: 6 });
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
    const uniqueSquads = Array.from(new Map(combinedSquads.map(squad => [squad.leader.name + squad.description, squad])).values());

    return { 
      message: 'success',
      squads: uniqueSquads,
      squadsInput: { query }
    };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    const fallbackPrompt = generatePromptFromTemplate(squadBuilderAIPrompt, { count, query, loadMoreQuery });
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
        const errorMessage = e instanceof Error ? e.message : String(e);
        const fallbackPrompt = generatePromptFromTemplate(testCaseAssistantAIPrompt, input);
        return { ...prevState, testCaseInput: input, message: `An error occurred: ${errorMessage}`, fallbackPrompt };
    }
}

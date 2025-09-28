'use server';

import {z} from 'zod';
import {
  unitMatchingAI,
  type UnitMatchingAIOutput,
} from '@/ai/flows/character-matching-ai';
import {
  squadBuilderAI,
  type SquadBuilderAIInput,
  type SquadBuilderAIOutput,
} from '@/ai/flows/squad-builder-ai';
import {
  testCaseAssistantAI,
  type TestCaseAssistantAIInput,
  type TestCaseAssistantAIOutput,
} from '@/ai/flows/test-case-assistant-ai';

const findUnitsSchema = z.object({
  query: z
    .string({
      required_error: 'Please describe the unit you are looking for.',
    })
    .min(1, 'Please describe the unit you are looking for.'),
  count: z.coerce.number().optional().default(10),
});

const buildSquadSchema = z.object({
  query: z
    .string({
      required_error: 'Please describe the squad you want to build.',
    })
    .min(1, 'Please describe the squad you want to build.'),
    count: z.coerce.number().optional().default(3),
});

const TestCaseAssistantAIInputSchema = z.object({
  testCase: z
    .string({required_error: 'Please provide the test case details.'})
    .min(1, 'Please provide the test case details.'),
  unitDetails: z
    .string({required_error: 'Please provide the new unit details.'})
    .min(1, 'Please provide the new unit details.'),
  expectedResult: z
    .string({required_error: 'Please provide the expected result.'})
    .min(1, 'Please provide the expected result.'),
});


export type FormState = {
  message: string;
  query?: string;
  units?: UnitMatchingAIOutput['units'];
  squads?: SquadBuilderAIOutput['squads'];
  testCase?: TestCaseAssistantAIOutput;
  testCaseInput?: TestCaseAssistantAIInput;
  squadsInput?: SquadBuilderAIInput;
};

export async function findUnits(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = findUnitsSchema.safeParse({
    query: formData.get('query'),
    count: formData.get('count'),
  });

  if (!validatedFields.success) {
    return {
      message:
        validatedFields.error.flatten().fieldErrors.query?.[0] ??
        'Invalid query.',
    };
  }

  const { query, count } = validatedFields.data;

  try {
    const result = await unitMatchingAI({query, count});

    if (!result.units || result.units.length === 0) {
      return {
        message:
          'Could not find any matching units. Please try a different query.',
        query,
      };
    }

    return {
      message: 'success',
      units: result.units,
      query,
    };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Error in findUnits action for query "${query}":`, errorMessage);
    return {
      message:
        'An error occurred while searching for units. Please try again later.',
      query,
    };
  }
}

export async function buildSquad(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = buildSquadSchema.safeParse({
    query: formData.get('query'),
    count: formData.get('count'),
  });

  if (!validatedFields.success) {
    return {
      message:
        validatedFields.error.flatten().fieldErrors.query?.[0] ??
        'Invalid query.',
    };
  }

  const { query, count } = validatedFields.data;
  const input = { query, count };

  try {
    const result = await squadBuilderAI(input);
    if (!result.squads || result.squads.length === 0) {
      return {
        message:
          'Could not generate any matching squads. Please try a different query.',
        squadsInput: input,
      };
    }

    return {
      message: 'success',
      squads: result.squads,
      squadsInput: input,
    };
  } catch (e) {
    console.error('Error in buildSquad action:', e);
    return {
      message:
        'An error occurred while building the squad. Please try again later.',
        squadsInput: input,
    };
  }
}


export async function generateTestCase(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = TestCaseAssistantAIInputSchema.safeParse({
    testCase: formData.get('testCase'),
    unitDetails: formData.get('unitDetails'),
    expectedResult: formData.get('expectedResult'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const message = Object.values(fieldErrors).flat()[0] || 'Invalid input.';
    return {
      message,
    };
  }
  
  const input = validatedFields.data;

  try {
    const result = await testCaseAssistantAI(input);
    return {
      message: 'success',
      testCase: result,
      testCaseInput: input,
    };
  } catch (e) {
    console.error('Error in generateTestCase action:', e);
    return {
      message: 'An error occurred while generating the test case. Please try again later.',
      testCaseInput: input,
    };
  }
}

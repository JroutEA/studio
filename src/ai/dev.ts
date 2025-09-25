'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/character-matching-ai';
import '@/ai/flows/squad-builder-ai';
import '@/ai/flows/test-case-assistant-ai';
import '@/ai/tools/wiki-search';

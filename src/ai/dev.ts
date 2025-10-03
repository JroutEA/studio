'use server';
import { config } from 'dotenv';
config();

// The flows are now called directly by server actions,
// so they no longer need to be registered for development execution.
// We still import the tool to ensure it's available.
import '@/ai/tools/wiki-search';

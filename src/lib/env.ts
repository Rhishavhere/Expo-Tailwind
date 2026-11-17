import { z } from 'zod';
const schema = z.object({
  url: z.url().refine(v => v.startsWith('https://'), 'Use your HTTPS Supabase project URL.'),
  key: z.string().min(20).refine(v => v.startsWith('sb_publishable_') || v.startsWith('eyJ'), 'Use a publishable or legacy anon key.'),
});
export const environment = schema.safeParse({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  key: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

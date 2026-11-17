import { z } from 'zod';
export const suggestionSchema=z.object({
 title:z.string().min(1).max(120),summary:z.string().max(2000),
 items:z.array(z.object({day_date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),title:z.string().min(1).max(120),description:z.string().max(2000),category:z.string().max(40),estimated_cost_minor:z.number().int().nonnegative().max(100000000)})).min(1).max(30),
 warnings:z.array(z.string().max(500)).max(10),
});
export type Suggestion=z.infer<typeof suggestionSchema>&{mode:'demo'|'ai'};

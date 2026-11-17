import { z } from 'zod';
export const signInSchema = z.object({ email: z.email('Enter a valid email.').trim().toLowerCase(), password: z.string().min(1, 'Enter your password.') });
export const signUpSchema = signInSchema.extend({ displayName: z.string().trim().min(2, 'Use at least 2 characters.').max(60), password: z.string().min(8, 'Use at least 8 characters.').max(128) });
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

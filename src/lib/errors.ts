export function message(error: unknown): string {
  if (error instanceof Error && /network|fetch|offline/i.test(error.message)) return 'Could not connect. Check your internet and try again.';
  if (error instanceof Error && /invalid login/i.test(error.message)) return 'That email and password do not match.';
  if (error instanceof Error && /email not confirmed/i.test(error.message)) return 'Confirm your email, then sign in.';
  if (error instanceof Error && /rate limit/i.test(error.message)) return 'Too many attempts. Please wait a little and try again.';
  if (error instanceof Error && /password|capacity|five|pending|already|owner|member|conflict|changed|dates|currency|split|username/i.test(error.message)) return error.message;
  return 'Something went wrong. Please try again. If it continues, check the project setup.';
}

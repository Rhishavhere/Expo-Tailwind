import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 }, mutations: { retry: false } } });
export const keys = {
  profile: (id: string | undefined) => ['profile', id] as const,
  destinations: ['destinations'] as const,
  places: ['places'] as const,
  trips: ['trips'] as const,
  trip: (id: string) => ['trip', id] as const,
  saved: ['saved'] as const,
  incoming: ['incoming'] as const,
};

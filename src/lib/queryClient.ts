import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query client for TRAVESÍA
 * - Handles server-state caching and synchronization
 * - Respects Supabase session and single-source-of-truth principles
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        // Do not retry 401/403 auth errors
        if (error?.status === 401 || error?.status === 403 || error?.code === 'PGRST301') {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

import { QueryClient, QueryFunction, MutationCache, QueryCache } from "@tanstack/react-query";
import { API_CONFIG, getFullUrl, getHeaders } from "@/config/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Enhanced error with more context for AWS Amplify
    const error = new Error(`${res.status}: ${text}`);
    (error as any).status = res.status;
    (error as any).response = res;
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : getFullUrl(url);

  const res = await fetch(fullUrl, {
    method,
    headers: data ? getHeaders('default') : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: API_CONFIG.CREDENTIALS,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const url = (queryKey[0] as string).startsWith('http') 
      ? queryKey[0] as string
      : getFullUrl(queryKey[0] as string);

    const res = await fetch(url, {
      headers: getHeaders('default'),
      credentials: API_CONFIG.CREDENTIALS,
      signal, // Support for AbortController
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Enhanced error logging for AWS Amplify
const logQueryError = (error: unknown, query: any) => {
  const errorData = {
    queryKey: query.queryKey,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
    } : error,
    timestamp: new Date().toISOString(),
    retryCount: query.state.failureCount,
  };

  // In production, send to AWS CloudWatch
  if (process.env.NODE_ENV === 'production') {
    console.error('Query failed:', errorData);
    // TODO: Integrate with AWS CloudWatch Logs
  } else {
    console.error('Query failed:', errorData);
  }
};

const logMutationError = (error: unknown, mutation: any) => {
  const errorData = {
    mutationKey: mutation.options.mutationKey,
    variables: mutation.state.variables,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
    } : error,
    timestamp: new Date().toISOString(),
    retryCount: mutation.state.failureCount,
  };

  // In production, send to AWS CloudWatch
  if (process.env.NODE_ENV === 'production') {
    console.error('Mutation failed:', errorData);
    // TODO: Integrate with AWS CloudWatch Logs
  } else {
    console.error('Mutation failed:', errorData);
  }
  };

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: logQueryError,
  }),
  mutationCache: new MutationCache({
    onError: logMutationError,
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      // Optimized for AWS Amplify + CloudFront
      staleTime: 5 * 60 * 1000, // 5 minutes - good for recipe data
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in memory longer
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Important for mobile users
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (except 429)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      // Network mode for better offline support
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      networkMode: 'online',
    },
  },
});

// Add global error handler for network issues
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    queryClient.resumePausedMutations();
    queryClient.invalidateQueries();
  });

  window.addEventListener('offline', () => {
    // Could implement offline queue here
    console.log('App went offline - queries will be paused');
  });
}
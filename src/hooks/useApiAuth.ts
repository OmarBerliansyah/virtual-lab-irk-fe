import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

const pendingRequests = new Map<string, Promise<Response>>();

export function useApiAuth() {
  const { getToken } = useAuth();
  
  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, [getToken]);

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const isGetRequest = !options.method || options.method.toUpperCase() === 'GET';
    const requestKey = isGetRequest ? `${endpoint}_${JSON.stringify(options.headers || {})}` : null;
    
    if (requestKey && pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }
    
    const headers = await getAuthHeaders();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    const requestPromise = fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      },
      signal: AbortSignal.timeout(30000),
    }).finally(() => {
      if (requestKey) {
        pendingRequests.delete(requestKey);
      }
    });
    
    if (requestKey) {
      pendingRequests.set(requestKey, requestPromise);
    }
    
    return requestPromise;
  }, [getAuthHeaders]);

  return { getAuthHeaders, apiCall };
}
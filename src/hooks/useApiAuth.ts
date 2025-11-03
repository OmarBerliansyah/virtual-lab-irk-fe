import { useAuth } from '@clerk/clerk-react';

export function useApiAuth() {
  const { getToken } = useAuth();
  
  const getAuthHeaders = async () => {
    const token = await getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const headers = await getAuthHeaders();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    return fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });
  };

  return { getAuthHeaders, apiCall };
}
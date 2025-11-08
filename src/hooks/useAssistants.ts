import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiAuth } from './useApiAuth';

interface Assistant {
  _id: string;
  name: string;
  email: string;
  nim: string;
  angkatan: string;
  role: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateAssistantData {
  name: string;
  email: string;
  nim: string;
  role?: string;
  image?: string;
  isActive?: boolean;
}

interface UpdateAssistantData {
  name?: string;
  role?: string;
  image?: string;
  isActive?: boolean;
}

// Get all assistants
export const useAssistants = (activeOnly: boolean = false) => {
  const { apiCall } = useApiAuth();
  
  return useQuery({
    queryKey: ['assistants', activeOnly],
    queryFn: async () => {
      const response = await apiCall(`/api/assistants${activeOnly ? '?active=true' : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assistants');
      }
      
      const data = await response.json();
      return data.data as Assistant[];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  });
};

// Get current user's assistant profile
export const useMyAssistantProfile = () => {
  const { apiCall } = useApiAuth();
  
  return useQuery({
    queryKey: ['assistants', 'me'],
    queryFn: async () => {
      const response = await apiCall('/api/assistants/me');
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User is not an assistant
        }
        throw new Error('Failed to fetch assistant profile');
      }
      
      const data = await response.json();
      return data.data as Assistant;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get assistant by ID
export const useAssistant = (id: string) => {
  const { apiCall } = useApiAuth();
  
  return useQuery({
    queryKey: ['assistants', id],
    queryFn: async () => {
      const response = await apiCall(`/api/assistants/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assistant');
      }
      
      const data = await response.json();
      return data.data as Assistant;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create assistant (admin only)
export const useCreateAssistant = () => {
  const { apiCall } = useApiAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assistantData: CreateAssistantData) => {
      const response = await apiCall('/api/assistants', {
        method: 'POST',
        body: JSON.stringify(assistantData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assistant');
      }
      
      const data = await response.json();
      return data.data as Assistant;
    },
    onSuccess: () => {
      // Invalidate assistants queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
    },
  });
};

// Update assistant
export const useUpdateAssistant = () => {
  const { apiCall } = useApiAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAssistantData }) => {
      const response = await apiCall(`/api/assistants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update assistant');
      }
      
      const responseData = await response.json();
      return responseData.data as Assistant;
    },
    onSuccess: (data, variables) => {
      // Update specific assistant in cache
      queryClient.setQueryData(['assistants', variables.id], data);
      
      // Invalidate assistants list and current user profile if updated own profile
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
      queryClient.invalidateQueries({ queryKey: ['assistants', 'me'] });
    },
  });
};

// Delete assistant (admin only)
export const useDeleteAssistant = () => {
  const { apiCall } = useApiAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiCall(`/api/assistants/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete assistant');
      }
      
      return true;
    },
    onSuccess: () => {
      // Invalidate assistants queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
    },
  });
};

// Toggle assistant active status (admin only)
export const useToggleAssistantActive = () => {
  const { apiCall } = useApiAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiCall(`/api/assistants/${id}/toggle-active`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle assistant status');
      }
      
      const data = await response.json();
      return data.data as Assistant;
    },
    onSuccess: (data, id) => {
      // Update specific assistant in cache
      queryClient.setQueryData(['assistants', id], data);
      
      // Invalidate assistants list to refetch data
      queryClient.invalidateQueries({ queryKey: ['assistants'] });
    },
  });
};

export type { Assistant, CreateAssistantData, UpdateAssistantData };
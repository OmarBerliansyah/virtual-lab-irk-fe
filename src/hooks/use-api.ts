import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { createAuthenticatedApi, publicApi } from '@/services/api';
import { useApiAuth } from './useApiAuth';
import { useToast } from '@/hooks/use-toast';
import type { Event, Task, User } from '@/types/api';

// Events API Hooks
export const useEvents = (course?: string) => {
  return useQuery({
    queryKey: ['events', course],
    queryFn: async () => {
      return publicApi.getEvents(course);
    },
  });
};

export const useCreateEvent = () => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (event: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>) => {
      return api.createEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 20000, 
      });
    },
  });
};

export const useUpdateEvent = () => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, event }: { id: string; event: Partial<Event> }) => {
      return api.updateEvent(id, event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteEvent = () => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.deleteEvent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Tasks API Hooks
export const useTasks = () => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      return api.getTasks();
    },
  });
};

export const useCreateTask = () => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => {
      return api.createTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 20000, 
      });
    },
  });
};

export const useUpdateTask = () => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, task }: { id: string; task: Partial<Task> }) => {
      return api.updateTask(id, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTask = () => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Health check
export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      return publicApi.getHealth();
    },
    refetchInterval: 30000,
  });
};

// Admin API Hooks
export const useGetUser = () => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      return api.getAllUsers();
    },
  });
};

export const useGetUserById = (id: string) => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: async () => {
      return api.getUserById(id);
    },
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      return api.updateUser(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteUser = () => {
  const { getAuthHeaders } = useApiAuth();
  const api = createAuthenticatedApi(getAuthHeaders);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
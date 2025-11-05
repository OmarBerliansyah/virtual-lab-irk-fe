import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { adminApi, eventsApi, tasksApi, Event, Task, User } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';


// Events API Hooks
export const useEvents = (course?: string) => {
  return useQuery({
    queryKey: ['events', course],
    queryFn: async () => {
      return eventsApi.getEvents(course);
    },
  });
};

export const useCreateEvent = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (event: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>) => {
      const token = await getToken();
      return eventsApi.createEvent(event, token || undefined);
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
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, event }: { id: string; event: Partial<Event> }) => {
      const token = await getToken();
      return eventsApi.updateEvent(id, event, token || undefined);
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
        duration: 20000, 
      });
    },
  });
};

export const useDeleteEvent = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return eventsApi.deleteEvent(id, token || undefined);
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
        duration: 20000, 
      });
    },
  });
};

// Tasks API Hooks
export const useTasks = () => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const token = await getToken();
      return tasksApi.getTasks(token || undefined);
    },
  });
};

export const useCreateTask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => {
      const token = await getToken();
      return tasksApi.createTask(task, token || undefined);
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
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, task }: { id: string; task: Partial<Task> }) => {
      const token = await getToken();
      return tasksApi.updateTask(id, task, token || undefined);
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
        duration: 20000, 
      });
    },
  });
};

export const useDeleteTask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return tasksApi.deleteTask(id, token || undefined);
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
        duration: 20000, 
      });
    },
  });
};

export const useGetUser = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['admin'],
    queryFn: async () => {
      const token = await getToken();
      return adminApi.getAllUsers(token || undefined);
    },
  });
}

export const useGetUserById = (id: string) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['admin'],
    queryFn: async () => {
      const token = await getToken();
      return adminApi.getUserById(id, token || undefined);
    },
  });
};

export const useCreateUserById = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const token = await getToken();
      return adminApi.createUserById(id, role, token || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast({
        title: "Success",
        description: "User created successfully",
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

export const useUpdateUserById = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return adminApi.updateUserById(id, token || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
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

export const useUpdateUser = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const token = await getToken();
      return adminApi.updateUser(id, data, token || undefined);
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
        duration: 20000, 
      });
    }
  });
};

export const useDeleteUser = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return adminApi.deleteUser(id, token || undefined);
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
        duration: 20000, 
      });
    },
  });
};
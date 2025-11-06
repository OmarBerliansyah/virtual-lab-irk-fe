import type {
  User,
  Event, 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  CreateEventRequest, 
  UpdateEventRequest,
  UpdateUserRequest,
  UserProfileResponse,
  HealthResponse 
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API service without authentication (public endpoints)
export const publicApi = {
  // Events (public read)
  getEvents: async (course?: string): Promise<Event[]> => {
    const url = course 
      ? `${API_BASE_URL}/api/events?course=${encodeURIComponent(course)}`
      : `${API_BASE_URL}/api/events`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  // Health check
  getHealth: async (): Promise<HealthResponse> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  }
};

// API service factory that requires auth headers
export const createAuthenticatedApi = (getAuthHeaders: () => Promise<Record<string, string>>) => ({
  getProfile: async (): Promise<UserProfileResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, { headers });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  updateProfile: async (userData: UpdateUserRequest): Promise<UserProfileResponse> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update user profile');
    return response.json();
  },

  // Tasks CRUD
  getTasks: async (): Promise<Task[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/tasks`, { headers });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  updateTask: async (id: string, task: UpdateTaskRequest): Promise<Task> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  deleteTask: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) throw new Error('Failed to delete task');
  },

  // Events CRUD (assistant only)
  createEvent: async (event: CreateEventRequest): Promise<Event> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(event)
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  },

  updateEvent: async (id: string, event: UpdateEventRequest): Promise<Event> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(event)
    });
    if (!response.ok) throw new Error('Failed to update event');
    return response.json();
  },

  deleteEvent: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) throw new Error('Failed to delete event');
  },

  // Admin - User Management
  getAllUsers: async (): Promise<User[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getUserById: async (id: string): Promise<User> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  deleteUser: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) throw new Error('Failed to delete user');
  }
});
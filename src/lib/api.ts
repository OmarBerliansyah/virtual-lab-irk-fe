// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API Client with authentication
export class ApiClient {
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    // Get auth token from Clerk
    const { useAuth } = await import('@clerk/clerk-react');
    
    // Note: This needs to be called from within a React component/hook
    // For now, we'll handle auth at the component level
    return {
      'Content-Type': 'application/json',
    };
  }

  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Generic CRUD methods
  static async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {}, token);
  }

  static async post<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  static async put<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  }

  static async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    }, token);
  }
}

// Type Definitions
export interface Event {
  _id: string;
  title: string;
  start: string;
  end?: string;
  course: string;
  type: 'deadline' | 'release' | 'assessment';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'To Do' | 'In Progress' | 'Done';
  dueDate?: string;
  assignee?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  _id: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assistant {
  _id: string;
  name: string;
  role: string;
  image?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomeData {
  courses: Course[];
  highlights: Highlight[];
  assistants: Assistant[];
}

// API Services
export const homeApi = {
  getHomeData: (token?: string): Promise<HomeData> => ApiClient.get('/api/home', token),
};

export const eventsApi = {
  getEvents: (course?: string, token?: string): Promise<Event[]> => 
    ApiClient.get(`/api/events${course ? `?course=${course}` : ''}`, token),
  createEvent: (event: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>, token?: string): Promise<Event> =>
    ApiClient.post('/api/events', event, token),
  updateEvent: (id: string, event: Partial<Event>, token?: string): Promise<Event> =>
    ApiClient.put(`/api/events/${id}`, event, token),
  deleteEvent: (id: string, token?: string): Promise<void> =>
    ApiClient.delete(`/api/events/${id}`, token),
};

export const tasksApi = {
  getTasks: (token?: string): Promise<Task[]> => ApiClient.get('/api/tasks', token),
  createTask: (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>, token?: string): Promise<Task> =>
    ApiClient.post('/api/tasks', task, token),
  updateTask: (id: string, task: Partial<Task>, token?: string): Promise<Task> =>
    ApiClient.put(`/api/tasks/${id}`, task, token),
  deleteTask: (id: string, token?: string): Promise<void> =>
    ApiClient.delete(`/api/tasks/${id}`, token),
};

export default ApiClient;
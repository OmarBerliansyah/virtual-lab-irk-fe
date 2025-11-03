// API Types
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
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: string;
  assignee?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Request body types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'To Do' | 'In Progress' | 'Done';
  dueDate?: string;
  assignee?: string;
  tags?: string[];
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>;

export interface CreateEventRequest {
  title: string;
  start: string;
  end?: string;
  course: string;
  type: 'deadline' | 'release' | 'assessment';
}

export type UpdateEventRequest = Partial<CreateEventRequest>;

// Response types
export interface HealthResponse {
  status: string;
  timestamp: string;
}
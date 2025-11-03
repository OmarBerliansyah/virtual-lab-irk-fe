// API Types
export interface Course {
  _id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  _id: string;
  type: 'tasks' | 'publication' | 'project';
  title: string;
  description: string;
  image: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assistant {
  _id: string;
  name: string;
  role: string;
  image: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

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
export interface HomeDataResponse {
  courses: Course[];
  highlights: Highlight[];
  assistants: Assistant[];
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
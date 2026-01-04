// API Types
export interface User {
  _id: string;
  clerkId: string;
  email: string;
  role: 'USER' | 'ASSISTANT' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUser {
  profilePicture: string;
  id: string;
  clerkId: string;
  email: string;
  role: 'USER' | 'ASSISTANT' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  start: string;
  end?: string;
  course: string;
  type: 'deadline' | 'release' | 'assessment' | 'highlight';
  description?: string;
  photoUrl?: string;
  linkAttachments?: Array<{
    title: string;
    url: string;
  }>;
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
  assistantId?: string;
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
  assistantId: string;
  tags?: string[];
}

export type UpdateTaskRequest = Partial<CreateTaskRequest>;

export interface CreateEventRequest {
  title: string;
  start: string;
  end?: string;
  course: string;
  type: 'deadline' | 'release' | 'assessment' | 'highlight';
  description?: string;
  photoUrl?: string;
  linkAttachments?: Array<{
    title: string;
    url: string;
  }>;
}

export type UpdateEventRequest = Partial<CreateEventRequest>;

// User request types
export interface UpdateUserRequest {
  email?: string;
}

// Response types
export interface UserProfileResponse {
  success: boolean;
  user: ProfileUser;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: number;
  email: string;
}

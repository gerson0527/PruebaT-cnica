export type Priority = 'alta' | 'media' | 'baja';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  categoryId: string | null;
  priority: Priority | null;
  createdAt: number;
}

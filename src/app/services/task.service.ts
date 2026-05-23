import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Task, Priority } from '../models/task.model';
import { v4 as uuidv4 } from 'uuid';

const TASKS_KEY = 'tasks';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks$ = new BehaviorSubject<Task[]>([]);
  private storageReady = false;

  constructor(private storage: Storage) {
    this.init();
  }

  private async init(): Promise<void> {
    await this.storage.create();
    this.storageReady = true;
    const tasks = await this.storage.get(TASKS_KEY);
    this.tasks$.next(tasks || []);
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$.asObservable();
  }

  async addTask(title: string, categoryId: string | null, priority: Priority | null = null): Promise<void> {
    try {
      const task: Task = {
        id: uuidv4(),
        title,
        completed: false,
        categoryId,
        priority,
        createdAt: Date.now()
      };
      const tasks = [...this.tasks$.value, task];
      await this.saveTasks(tasks);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  async updateTask(task: Task): Promise<void> {
    try {
      const tasks = this.tasks$.value.map(t => t.id === task.id ? task : t);
      await this.saveTasks(tasks);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const tasks = this.tasks$.value.filter(t => t.id !== id);
      await this.saveTasks(tasks);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async toggleComplete(id: string): Promise<void> {
    try {
      const tasks = this.tasks$.value.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      await this.saveTasks(tasks);
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  }

  filterByCategory(categoryId: string | null): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => categoryId
        ? tasks.filter(t => t.categoryId === categoryId)
        : tasks
      )
    );
  }

  searchTasks(query: string): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => tasks.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  private async saveTasks(tasks: Task[]): Promise<void> {
    this.tasks$.next(tasks);
    if (this.storageReady) {
      await this.storage.set(TASKS_KEY, tasks);
    }
  }
}

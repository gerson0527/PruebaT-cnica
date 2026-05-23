import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES_KEY = 'categories';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-personal', name: 'Personal', color: '#6C63FF' },
  { id: 'cat-trabajo', name: 'Trabajo', color: '#FF6584' },
  { id: 'cat-estudio', name: 'Estudio', color: '#43E97B' },
];

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories$ = new BehaviorSubject<Category[]>([]);
  private storageReady = false;

  constructor(private storage: Storage) {
    this.init();
  }

  private async init(): Promise<void> {
    await this.storage.create();
    this.storageReady = true;
    let categories = await this.storage.get(CATEGORIES_KEY);
    if (!categories || categories.length === 0) {
      categories = DEFAULT_CATEGORIES;
      await this.storage.set(CATEGORIES_KEY, categories);
    }
    this.categories$.next(categories);
  }

  getCategories(): Observable<Category[]> {
    return this.categories$.asObservable();
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories$.value.find(c => c.id === id);
  }

  async addCategory(name: string, color: string): Promise<void> {
    try {
      const category: Category = {
        id: uuidv4(),
        name,
        color
      };
      const categories = [...this.categories$.value, category];
      await this.saveCategories(categories);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  async updateCategory(category: Category): Promise<void> {
    try {
      const categories = this.categories$.value.map(c =>
        c.id === category.id ? category : c
      );
      await this.saveCategories(categories);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      const categories = this.categories$.value.filter(c => c.id !== id);
      await this.saveCategories(categories);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  private async saveCategories(categories: Category[]): Promise<void> {
    this.categories$.next(categories);
    if (this.storageReady) {
      await this.storage.set(CATEGORIES_KEY, categories);
    }
  }
}

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import {
  IonHeader, IonToolbar, IonContent, IonSearchbar,
  IonItem, IonItemSliding, IonItemOptions,
  IonItemOption, IonButtons, IonIcon,
  ToastController, AlertController, ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, trashOutline, checkmarkDoneOutline,
  createOutline, funnelOutline, ellipseOutline, checkmarkCircle,
  arrowUpCircleOutline, removeCircleOutline, arrowDownCircleOutline
} from 'ionicons/icons';

import { Task } from '../models/task.model';
import { Category } from '../models/category.model';
import { TaskService } from '../services/task.service';
import { CategoryService } from '../services/category.service';
import { FeatureFlagService } from '../services/feature-flag.service';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ScrollingModule,
    IonHeader, IonToolbar, IonContent, IonSearchbar,
    IonItem, IonItemSliding, IonItemOptions,
    IonItemOption, IonButtons, IonIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  tasks: Task[] = [];
  categories: Category[] = [];
  selectedCategoryId: string | null = null;
  statusFilter: 'all' | 'pending' | 'completed' = 'all';
  searchQuery = '';
  showPriority = false;

  private subscriptions = new Subscription();

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private featureFlagService: FeatureFlagService,
    private toastController: ToastController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    addIcons({
      addOutline, trashOutline, checkmarkDoneOutline,
      createOutline, funnelOutline, ellipseOutline, checkmarkCircle,
      arrowUpCircleOutline, removeCircleOutline, arrowDownCircleOutline
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      combineLatest([
        this.taskService.getTasks(),
        this.categoryService.getCategories(),
        this.featureFlagService.isFeatureEnabled('show_priority_feature')
      ]).subscribe(([tasks, categories, showPriority]) => {
        this.tasks = tasks;
        this.categories = categories;
        this.showPriority = showPriority;
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get taskStats(): { ongoing: number; inProcess: number; completed: number; total: number } {
    const ongoing = this.tasks.filter(t => !t.completed);
    return {
      ongoing: ongoing.length,
      inProcess: ongoing.filter(t => t.priority === 'media' || t.priority === 'alta').length,
      completed: this.tasks.filter(t => t.completed).length,
      total: this.tasks.length,
    };
  }

  get hasActiveFilters(): boolean {
    return this.selectedCategoryId !== null || this.statusFilter !== 'all';
  }

  get filteredTasks(): Task[] {
    let filtered = this.tasks;
    if (this.selectedCategoryId) {
      filtered = filtered.filter(t => t.categoryId === this.selectedCategoryId);
    }
    if (this.statusFilter === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (this.statusFilter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q));
    }
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId = this.selectedCategoryId === categoryId ? null : categoryId;
    this.cdr.markForCheck();
  }

  async openFilters(): Promise<void> {
    const buttons = [
      {
        text: this.statusFilter === 'all' ? '✓ Todas' : 'Todas',
        handler: () => this.setStatusFilter('all'),
      },
      {
        text: this.statusFilter === 'pending' ? '✓ Pendientes' : 'Pendientes',
        handler: () => this.setStatusFilter('pending'),
      },
      {
        text: this.statusFilter === 'completed' ? '✓ Completadas' : 'Completadas',
        handler: () => this.setStatusFilter('completed'),
      },
      ...this.categories.map(category => ({
        text: this.selectedCategoryId === category.id ? `✓ ${category.name}` : category.name,
        handler: () => this.selectCategory(category.id),
      })),
      ...(this.hasActiveFilters
        ? [{ text: 'Limpiar filtros', role: 'destructive' as const, handler: () => this.clearFilters() }]
        : []),
      { text: 'Cancelar', role: 'cancel' as const },
    ];

    const sheet = await this.actionSheetController.create({
      header: 'Filtrar tareas',
      buttons,
    });
    await sheet.present();
  }

  private setStatusFilter(filter: 'all' | 'pending' | 'completed'): void {
    this.statusFilter = filter;
    this.cdr.markForCheck();
  }

  clearFilters(): void {
    this.selectedCategoryId = null;
    this.statusFilter = 'all';
    this.cdr.markForCheck();
  }

  onSearchChange(event: CustomEvent): void {
    this.searchQuery = event.detail.value || '';
    this.cdr.markForCheck();
  }

  getCategoryColor(categoryId: string | null): string {
    if (!categoryId) return '#888';
    const cat = this.categories.find(c => c.id === categoryId);
    return cat ? cat.color : '#888';
  }

  getCategoryName(categoryId: string | null): string {
    if (!categoryId) return 'Sin categoría';
    const cat = this.categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Sin categoría';
  }

  getTaskProgress(task: Task): number {
    if (task.completed) return 100;
    switch (task.priority) {
      case 'alta': return 75;
      case 'media': return 50;
      case 'baja': return 25;
      default: return 40;
    }
  }

  getTaskRingColor(task: Task): string {
    if (task.completed) return 'var(--neo-teal)';
    if (task.priority) return this.getPriorityColor(task.priority);
    return this.getCategoryColor(task.categoryId);
  }

  getPriorityColor(priority: string | null): string {
    switch (priority) {
      case 'alta': return 'var(--neo-coral)';
      case 'media': return 'var(--neo-yellow)';
      case 'baja': return 'var(--neo-teal)';
      default: return 'var(--neo-blue)';
    }
  }

  getPriorityLabel(priority: string | null): string {
    switch (priority) {
      case 'alta': return 'Alta';
      case 'media': return 'Media';
      case 'baja': return 'Baja';
      default: return '';
    }
  }

  getPriorityIcon(priority: string | null): string {
    switch (priority) {
      case 'alta': return 'arrow-up-circle-outline';
      case 'media': return 'remove-circle-outline';
      case 'baja': return 'arrow-down-circle-outline';
      default: return 'ellipse-outline';
    }
  }

  async toggleComplete(task: Task): Promise<void> {
    try {
      await this.taskService.toggleComplete(task.id);
      const action = task.completed ? 'pendiente' : 'completada';
      await this.showToast(`Tarea marcada como ${action}`, 'success');
    } catch {
      await this.showToast('Error al actualizar la tarea', 'danger');
    }
  }

  async deleteTask(task: Task): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar tarea',
      message: `¿Estás seguro de eliminar "${task.title}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.taskService.deleteTask(task.id);
              await this.showToast('Tarea eliminada', 'warning');
            } catch {
              await this.showToast('Error al eliminar la tarea', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  editTask(task: Task): void {
    this.router.navigate(['/task-detail', task.id]);
  }

  addTask(): void {
    this.router.navigate(['/task-detail']);
  }

  trackById(_index: number, task: Task): string {
    return task.id;
  }

  trackByCategoryId(_index: number, category: Category): string {
    return category.id;
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
      cssClass: 'custom-toast',
    });
    await toast.present();
  }
}

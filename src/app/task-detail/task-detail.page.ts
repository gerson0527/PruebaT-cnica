import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonIcon, IonButtons, IonListHeader,
  ToastController, NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  saveOutline, arrowBackOutline, checkmarkOutline,
  arrowUpCircleOutline, removeCircleOutline, arrowDownCircleOutline
} from 'ionicons/icons';

import { Task, Priority } from '../models/task.model';
import { Category } from '../models/category.model';
import { TaskService } from '../services/task.service';
import { CategoryService } from '../services/category.service';
import { FeatureFlagService } from '../services/feature-flag.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonIcon, IonButtons, IonListHeader,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
})
export class TaskDetailPage implements OnInit, OnDestroy {
  taskTitle = '';
  selectedCategoryId: string | null = null;
  selectedPriority: Priority | null = null;
  categories: Category[] = [];
  isEditing = false;
  editingTask: Task | null = null;
  showPriority = false;

  readonly priorities: { value: Priority; label: string; color: string; icon: string }[] = [
    { value: 'alta', label: 'Alta', color: '#FF4757', icon: 'arrow-up-circle-outline' },
    { value: 'media', label: 'Media', color: '#FFA502', icon: 'remove-circle-outline' },
    { value: 'baja', label: 'Baja', color: '#2ED573', icon: 'arrow-down-circle-outline' },
  ];

  private subscriptions = new Subscription();

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private featureFlagService: FeatureFlagService,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
  ) {
    addIcons({
      saveOutline, arrowBackOutline, checkmarkOutline,
      arrowUpCircleOutline, removeCircleOutline, arrowDownCircleOutline
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.categoryService.getCategories().subscribe(categories => {
        this.categories = categories;
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.featureFlagService.isFeatureEnabled('show_priority_feature').subscribe(show => {
        this.showPriority = show;
        this.cdr.markForCheck();
      })
    );

    // Check if editing an existing task
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.subscriptions.add(
        this.taskService.getTasks().subscribe(tasks => {
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            this.isEditing = true;
            this.editingTask = task;
            this.taskTitle = task.title;
            this.selectedCategoryId = task.categoryId;
            this.selectedPriority = task.priority;
            this.cdr.markForCheck();
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  selectPriority(priority: Priority): void {
    this.selectedPriority = this.selectedPriority === priority ? null : priority;
    this.cdr.markForCheck();
  }

  async saveTask(): Promise<void> {
    if (!this.taskTitle.trim()) {
      await this.showToast('El título es obligatorio', 'warning');
      return;
    }

    try {
      if (this.isEditing && this.editingTask) {
        await this.taskService.updateTask({
          ...this.editingTask,
          title: this.taskTitle.trim(),
          categoryId: this.selectedCategoryId,
          priority: this.showPriority ? this.selectedPriority : this.editingTask.priority,
        });
        await this.showToast('Tarea actualizada', 'success');
      } else {
        await this.taskService.addTask(
          this.taskTitle.trim(),
          this.selectedCategoryId,
          this.showPriority ? this.selectedPriority : null,
        );
        await this.showToast('Tarea creada', 'success');
      }
      this.navCtrl.navigateBack('/home');
    } catch {
      await this.showToast('Error al guardar la tarea', 'danger');
    }
  }

  goBack(): void {
    this.navCtrl.navigateBack('/home');
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}

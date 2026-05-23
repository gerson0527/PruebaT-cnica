import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonItem, IonLabel, IonItemSliding, IonItemOptions,
  IonItemOption, IonFab, IonFabButton, IonIcon,
  IonNote, AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, createOutline, colorPaletteOutline } from 'ionicons/icons';

import { Category } from '../models/category.model';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonItem, IonLabel, IonItemSliding, IonItemOptions,
    IonItemOption, IonFab, IonFabButton, IonIcon,
    IonNote,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit, OnDestroy {
  categories: Category[] = [];
  private subscription = new Subscription();

  readonly colorOptions = [
    '#6C63FF', '#FF6584', '#43E97B', '#FFA502',
    '#FF4757', '#2ED573', '#1E90FF', '#FF6B6B',
    '#A855F7', '#F97316', '#14B8A6', '#EC4899',
  ];

  constructor(
    private categoryService: CategoryService,
    private alertController: AlertController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef,
  ) {
    addIcons({ addOutline, trashOutline, createOutline, colorPaletteOutline });
  }

  ngOnInit(): void {
    this.subscription.add(
      this.categoryService.getCategories().subscribe(categories => {
        this.categories = categories;
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async addCategory(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Nueva Categoría',
      cssClass: 'category-alert',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la categoría',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: async (data) => {
            if (!data.name?.trim()) {
              await this.showToast('El nombre es obligatorio', 'warning');
              return false;
            }
            try {
              const randomColor = this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)];
              await this.categoryService.addCategory(data.name.trim(), randomColor);
              await this.showToast('Categoría creada', 'success');
              return true;
            } catch {
              await this.showToast('Error al crear la categoría', 'danger');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async editCategory(category: Category): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Editar Categoría',
      cssClass: 'category-alert',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: category.name,
          placeholder: 'Nombre de la categoría',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.name?.trim()) {
              await this.showToast('El nombre es obligatorio', 'warning');
              return false;
            }
            try {
              await this.categoryService.updateCategory({
                ...category,
                name: data.name.trim()
              });
              await this.showToast('Categoría actualizada', 'success');
              return true;
            } catch {
              await this.showToast('Error al actualizar', 'danger');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async changeColor(category: Category): Promise<void> {
    const inputs = this.colorOptions.map((color, i) => ({
      name: 'color',
      type: 'radio' as const,
      label: `Color ${i + 1}`,
      value: color,
      checked: category.color === color,
      cssClass: `color-radio color-${i}`,
    }));

    const alert = await this.alertController.create({
      header: 'Cambiar Color',
      cssClass: 'color-alert',
      inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aplicar',
          handler: async (selectedColor: string) => {
            try {
              await this.categoryService.updateCategory({
                ...category,
                color: selectedColor
              });
              await this.showToast('Color actualizado', 'success');
            } catch {
              await this.showToast('Error al cambiar color', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteCategory(category: Category): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar Categoría',
      message: `¿Eliminar "${category.name}"? Las tareas asociadas no se eliminarán.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.categoryService.deleteCategory(category.id);
              await this.showToast('Categoría eliminada', 'warning');
            } catch {
              await this.showToast('Error al eliminar', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  trackById(_index: number, category: Category): string {
    return category.id;
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

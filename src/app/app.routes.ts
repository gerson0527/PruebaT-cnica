import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/categories.page').then(m => m.CategoriesPage),
      },
      {
        path: 'task-detail',
        loadComponent: () => import('./task-detail/task-detail.page').then(m => m.TaskDetailPage),
      },
      {
        path: 'task-detail/:id',
        loadComponent: () => import('./task-detail/task-detail.page').then(m => m.TaskDetailPage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

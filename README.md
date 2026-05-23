# TodoApp — Gestor de Tareas

Aplicación completa de gestión de tareas construida con **Ionic + Angular** con soporte para categorías, prioridades (via Firebase Remote Config), y compilación nativa con Capacitor.

---

## 📋 Descripción

TodoApp es una aplicación móvil/web de gestión de tareas que permite:
- Crear, editar, eliminar y completar tareas
- Organizar tareas por categorías con colores personalizados
- Filtrar tareas por categoría y buscar por texto
- Prioridad de tareas (Alta/Media/Baja) controlada por Firebase Remote Config
- Gestos de deslizamiento (swipe) para acciones rápidas
- Almacenamiento local persistente

## 🛠 Stack Tecnológico

| Tecnología | Versión |
|---|---|
| Ionic | 8+ |
| Angular | 20 (standalone components) |
| Capacitor | 8 |
| @ionic/storage-angular | Latest |
| @angular/fire + Firebase | Latest |
| TypeScript | 5.9 (strict mode) |

## 📦 Prerrequisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Android Studio** (para compilar Android)
- **Xcode 14+** (para compilar iOS, solo en Mac)
- Cuenta de Firebase (para Remote Config)

## 🚀 Instalación

```bash
git clone <repository-url>
cd todo-app
npm install
ionic build
npx cap sync
```

## 💻 Ejecución en navegador

```bash
ionic serve
```

## 📱 Ejecución en Android

1. Asegúrate de tener Android Studio instalado
2. Ejecuta:
```bash
ionic capacitor build android --prod
```
3. O directamente desde la CLI:
```bash
npx cap run android
```

### Generar APK de Debug:
```bash
cd android
./gradlew assembleDebug
```
El APK queda en: `android/app/build/outputs/apk/debug/`

### Generar APK de Release:
```bash
cd android
./gradlew assembleRelease
```

## 🍎 Ejecución en iOS (requiere Mac + Xcode 14+)

```bash
ionic capacitor build ios --prod
```
- Abrir el proyecto en Xcode → Product → Archive → Distribute App

## 🔧 Variables de Entorno

Configura tu archivo `src/environments/environment.ts` con las credenciales de Firebase:

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
```

### Firebase Remote Config

En Firebase Console → Remote Config, crea el parámetro:
- **Clave**: `show_priority_feature`
- **Tipo**: Boolean
- **Valor por defecto**: `false`

Cuando está activado (`true`), se muestra el selector de prioridad al crear/editar tareas.

## 📸 Capturas de Pantalla

> Pendiente: agregar screenshots de la aplicación

## 🏗 Arquitectura

```
src/app/
├── models/           # Interfaces (Task, Category)
├── services/         # Lógica de negocio (TaskService, CategoryService, FeatureFlagService)
├── pipes/            # Pipes puros para filtrado
├── home/             # Lista de tareas, filtros, búsqueda
├── categories/       # CRUD de categorías
├── task-detail/      # Crear/editar tarea
└── tabs/             # Navegación por tabs
```

## ⚡ Optimizaciones de Rendimiento

1. **Lazy Loading**: Todas las páginas se cargan con `loadComponent` en las rutas
2. **Virtual Scroll**: La lista de tareas usa `cdk-virtual-scroll-viewport` para renderizar solo los elementos visibles
3. **OnPush Change Detection**: Todos los componentes usan `ChangeDetectionStrategy.OnPush`
4. **TrackBy**: Todos los `@for` usan funciones `trackBy` para optimizar el DOM diffing
5. **Pipe Puro**: Filtrado de tareas mediante un pipe puro memoizado
6. **Lazy Icon Loading**: Iconos registrados con `addIcons` para carga optimizada


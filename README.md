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

## ❓ Preguntas Técnicas

### 1. Principales desafíos al implementar las nuevas funcionalidades

- **Migración a Standalone Components**: El scaffolding de Ionic genera proyectos con NgModules. Convertir todo a standalone components requirió reestructurar el bootstrap, las rutas y los imports de cada componente.
- **Firebase Remote Config con degradación graceful**: Implementar el feature flag de forma que la app funcione correctamente incluso sin Firebase configurado fue un reto. Se resolvió con importaciones dinámicas y try/catch.
- **Virtual Scroll con Ionic**: Integrar `@angular/cdk/scrolling` con los componentes de sliding de Ionic requirió ajustes en el layout y los estilos.

### 2. Técnicas de optimización aplicadas y por qué

- **OnPush + markForCheck()**: Reduce significativamente los ciclos de change detection al solo actualizar cuando los datos cambian explícitamente.
- **Virtual Scroll**: Para listas grandes (cientos de tareas), solo se renderizan los items visibles, mejorando FPS y memoria.
- **Lazy Loading**: El bundle principal es más pequeño, reduciendo el tiempo de carga inicial.
- **Pipe puro para filtrado**: Evita recalcular el filtro en cada ciclo de detección de cambios.

### 3. Cómo aseguré calidad y mantenibilidad del código

- **TypeScript estricto** (`strict: true`): Detecta errores en tiempo de compilación.
- **Separación de responsabilidades**: Toda la lógica de negocio está en servicios, los componentes solo manejan UI.
- **BehaviorSubject + Observable**: Patrón reactivo consistente para gestión de estado.
- **Convenciones de naming**: kebab-case para archivos, interfaces claras para modelos.
- **Manejo de errores**: try/catch en todas las operaciones con feedback al usuario via ion-toast.

## 📝 Conventional Commits

Este proyecto usa conventional commits:
- `feat:` — Nueva funcionalidad
- `fix:` — Corrección de bug
- `refactor:` — Refactorización sin cambio funcional
- `docs:` — Cambios en documentación
- `style:` — Cambios de estilo/formato
- `perf:` — Mejoras de rendimiento

## 📄 Licencia

MIT

# TodoApp — Gestor de Tareas

Aplicación completa de gestión de tareas construida con **Ionic + Angular** con soporte para categorías, prioridades (via Firebase Remote Config), y compilación nativa con **Apache Cordova**.

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
| Apache Cordova | 12 |
| cordova-android | 14 |
| @ionic/storage-angular | Latest |
| @angular/fire + Firebase | Latest |
| TypeScript | 5.9 (strict mode) |

## 📦 Prerrequisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Android Studio** + Android SDK (para compilar Android)
- **Xcode 14+** (para iOS, solo en Mac)
- Cuenta de Firebase (para Remote Config)

### Variable ANDROID_HOME (Windows)

Si `cordova build android` falla, configura el SDK en PowerShell:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

Instala **Android Studio** y el SDK desde **SDK Manager** si aún no lo tienes.

## 🚀 Instalación

```bash
git clone <repository-url>
cd todo-app
npm install
npm run build:cordova
npx cordova platform add android
```

> La primera vez, Cordova crea la carpeta `platforms/android`. iOS: `npx cordova platform add ios` (requiere Mac).

## 💻 Ejecución en navegador

```bash
npm start
```

## 📱 Compilar Android con Cordova

### APK de debug (entrega / pruebas)

```bash
npm run cordova:android:debug
```

APK generado en:

```
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### APK de release

```bash
npm run cordova:android:release
```

### Ejecutar en emulador o dispositivo

```bash
npm run cordova:run:android
```

### Abrir en Android Studio (opcional)

```bash
npm run build:cordova
npx cordova prepare android
```

Luego abre `platforms/android` en Android Studio.

## 🍎 Compilar iOS con Cordova (Mac + Xcode)

```bash
npm run build:cordova
npx cordova platform add ios
npm run cordova:ios
```

Abrir `platforms/ios/TodoApp.xcworkspace` en Xcode → Product → Archive.

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


# TodoApp

Aplicación desarrollada con Ionic y Angular para la gestión de tareas. Permite crear, editar, eliminar y completar tareas, organizarlas por categorías y asignar niveles de prioridad.

## Características

- Creación, edición y eliminación de tareas.
- Marcado de tareas completadas.
- Organización mediante categorías personalizadas.
- Búsqueda y filtrado de tareas.
- Manejo de prioridades (Alta, Media y Baja).
- Almacenamiento local para conservar la información del usuario.
- Acciones rápidas mediante gestos de deslizamiento.

## Variables de Entorno Configura tu archivo src/environments/environment.ts con las credenciales de Firebase:
typescript
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

### Firebase Remote Config 
En Firebase Console → Remote Config, crea el parámetro: 
**Clave**: show_priority_feature 
**Tipo**: Boolean 
**Valor por defecto**: false Cuando está activado (true), se muestra el selector de prioridad al crear/editar tareas.

## Tecnologías

- Ionic 8
- Angular 20
- TypeScript
- Apache Cordova
- Firebase Remote Config
- Ionic Storage
##APK:
platforms/android/app/build/outputs/apk/debug/app-debug.apk (no suele ir al repo; adjúntalo o indica cómo generarlo con npm run cordova:android:debug)

## Requisitos

- Node.js 18 o superior
- npm
- Ionic CLI
- Android Studio (Android)
- Xcode (iOS - macOS)

## Instalación

```bash
git clone <repositorio>
cd todo-app
npm install

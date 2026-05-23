import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.todoapp.app',
  appName: 'TodoApp',
  webDir: 'www/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;

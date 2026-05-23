import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.todoapp.app',
  appName: 'TodoApp',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;

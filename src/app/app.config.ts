import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes),
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideRemoteConfig(() => {
      const remoteConfig = getRemoteConfig();
      remoteConfig.defaultConfig = { show_priority_feature: false };
      remoteConfig.settings.minimumFetchIntervalMillis =
        typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 0
          : 300000;
      return remoteConfig;
    }),
  ]
};

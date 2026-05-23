import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Feature Flag Service
 * Uses Firebase Remote Config when available, with local fallback.
 * The service gracefully degrades if Firebase is not configured.
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  private featureFlags$ = new BehaviorSubject<Record<string, boolean>>({
    show_priority_feature: false
  });

  private initialized = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Attempt to use Firebase Remote Config
      const { getRemoteConfig, fetchAndActivate, getValue } = await import('firebase/remote-config');
      const { getApp } = await import('firebase/app');

      const app = getApp();
      const remoteConfig = getRemoteConfig(app);

      // Set minimum fetch interval
      remoteConfig.settings.minimumFetchIntervalMillis =
        window.location.hostname === 'localhost' ? 0 : 300000;

      // Set defaults
      remoteConfig.defaultConfig = {
        show_priority_feature: false
      };

      await fetchAndActivate(remoteConfig);

      const showPriority = getValue(remoteConfig, 'show_priority_feature').asBoolean();
      this.featureFlags$.next({
        ...this.featureFlags$.value,
        show_priority_feature: showPriority
      });

      this.initialized = true;
      console.log('Remote Config loaded. show_priority_feature:', showPriority);
    } catch (error) {
      console.warn('Firebase Remote Config not available, using defaults:', error);
      this.initialized = true;
    }
  }

  isFeatureEnabled(key: string): Observable<boolean> {
    return new Observable<boolean>(subscriber => {
      const sub = this.featureFlags$.subscribe(flags => {
        subscriber.next(flags[key] ?? false);
      });
      return () => sub.unsubscribe();
    });
  }

  /**
   * For development/testing: manually toggle a feature flag
   */
  toggleFeatureFlag(key: string, value: boolean): void {
    this.featureFlags$.next({
      ...this.featureFlags$.value,
      [key]: value
    });
  }
}

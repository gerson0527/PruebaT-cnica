import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import {
  fetchAndActivate,
  getValue,
  RemoteConfig,
} from '@angular/fire/remote-config';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

/**
 * Feature Flag Service
 * Uses Firebase Remote Config when available, with local fallback.
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  private remoteConfig = inject(RemoteConfig);
  private injector = inject(Injector);

  private featureFlags$ = new BehaviorSubject<Record<string, boolean>>({
    show_priority_feature: false
  });

  private initialized = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.remoteConfig.settings.minimumFetchIntervalMillis =
        window.location.hostname === 'localhost' ? 0 : 300000;
      this.remoteConfig.defaultConfig = {
        show_priority_feature: false
      };

      await runInInjectionContext(
        this.injector,
        () => fetchAndActivate(this.remoteConfig)
      );

      const showPriority = runInInjectionContext(this.injector, () =>
        getValue(this.remoteConfig, 'show_priority_feature').asBoolean()
      );

      this.initialized = true;
      this.featureFlags$.next({
        ...this.featureFlags$.value,
        show_priority_feature: showPriority
      });
    } catch {
      this.initialized = true;
      this.featureFlags$.next(this.featureFlags$.value);
    }
  }

  isFeatureEnabled(key: string): Observable<boolean> {
    return this.featureFlags$.pipe(
      filter(() => this.initialized),
      map(flags => flags[key] ?? false)
    );
  }

  toggleFeatureFlag(key: string, value: boolean): void {
    this.featureFlags$.next({
      ...this.featureFlags$.value,
      [key]: value
    });
  }
}

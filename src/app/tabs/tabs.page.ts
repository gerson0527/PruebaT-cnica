import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, home, listOutline, list, addCircleOutline, addCircle } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="tab-bar-custom">
        <ion-tab-button tab="home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Inicio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="categories">
          <ion-icon name="list-outline"></ion-icon>
          <ion-label>Categorías</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="task-detail">
          <ion-icon name="add-circle-outline"></ion-icon>
          <ion-label>Nueva</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    .tab-bar-custom {
      --background: var(--ion-card-background, #1e1e2e);
      --border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: env(safe-area-inset-bottom);
    }

    ion-tab-button {
      --color: #8888aa;
      --color-selected: #6C63FF;
      --padding-bottom: 6px;
      --padding-top: 6px;
    }

    ion-tab-button::part(native) {
      transition: transform 0.2s ease;
    }

    ion-tab-button.tab-selected::part(native) {
      transform: scale(1.05);
    }
  `],
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, home, listOutline, list, addCircleOutline, addCircle });
  }
}

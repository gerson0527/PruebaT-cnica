import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, listOutline, add } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="neo-tab-bar">
        <ion-tab-button tab="home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Inicio</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="categories">
          <ion-icon name="list-outline"></ion-icon>
          <ion-label>Categorías</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="task-detail" class="tab-add">
          <span class="add-btn" aria-hidden="true">
            <ion-icon name="add"></ion-icon>
          </span>
          <ion-label>Nueva</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, listOutline, add });
  }
}

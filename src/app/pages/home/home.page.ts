import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PopoverController, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon, IonTabs, IonTabBar,
  IonTabButton, IonLabel, IonContent, IonImg, IonNav
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { UserMenuComponent } from '../../components/user-menu/user-menu.component';
import { MenuService } from '../../services/menu.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { Subscription } from 'rxjs';
import { personCircleOutline, heartOutline, barbellOutline, nutritionOutline, personOutline, settingsOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonImg, IonNav, CommonModule, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon, IonTabs, IonTabBar, IonTabButton, IonLabel, IonContent, UserMenuComponent]
})
export class HomePage implements OnInit, OnDestroy {
  userProfile: any;
  userAvatar: string = 'person-circle-outline';
  private dismissSub: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController,
    private menuService: MenuService,
    private router: Router
  ) {
    addIcons({
      'person-circle-outline': personCircleOutline,
      'heart-outline': heartOutline,
      'barbell-outline': barbellOutline,
      'nutrition-outline': nutritionOutline,
      'person-outline': personOutline,
      'settings-outline': settingsOutline,
      'log-out-outline': logOutOutline
    });
  }

  ngOnInit() {
    this.authService.getUserProfile(true).subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.userAvatar = profile.avatar || 'person-circle-outline';
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      }
    });

    this.dismissSub = this.menuService.dismiss$.subscribe(() => {
      this.dismissPopover();
    });
  }

  ngOnDestroy() {
    if (this.dismissSub) {
      this.dismissSub.unsubscribe();
    }
  }

  async openUserMenu(ev: any) {
    const popover = await this.popoverController.create({
      component: UserMenuComponent,
      cssClass: 'user-menu-popover',
      event: ev,
      translucent: true,
      showBackdrop: true
    });

    await popover.present();
  }

  private async dismissPopover() {
    const popover = await this.popoverController.getTop();
    if (popover) {
      popover.dismiss();
    }
  }
}

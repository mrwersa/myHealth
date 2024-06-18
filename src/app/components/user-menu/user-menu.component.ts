import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MenuService } from '../../services/menu.service';
import { addIcons } from 'ionicons';
import { personOutline, settingsOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class UserMenuComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private menuService: MenuService
  ) {
    addIcons({
      'person-outline': personOutline,
      'settings-outline': settingsOutline,
      'log-out-outline': logOutOutline
    });
  }

  viewProfile() {
    this.router.navigate(['/profile']);
    this.dismiss();
  }

  openSettings() {
    this.router.navigate(['/settings']);
    this.dismiss();
  }

  logout() {
    this.authService.logout();
    this.dismiss();
  }

  dismiss() {
    this.menuService.dismissMenu();
  }
}

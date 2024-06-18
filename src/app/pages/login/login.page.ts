import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { IonContent, IonText, IonButton, IonIcon } from '@ionic/angular/standalone';
import { fitnessOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule, FormsModule, IonContent, IonText, IonButton]
})
export class LoginPage {
  constructor(private authService: AuthService) {
    addIcons({ "fitness-outline": fitnessOutline });
  }

  login() {
    this.authService.login();
  }
}

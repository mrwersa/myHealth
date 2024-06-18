import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { IonContent, IonSpinner, IonText, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-callback',
  templateUrl: 'callback.page.html',
  styleUrls: ['callback.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCardTitle, IonCardHeader, IonCard, CommonModule, IonContent, IonSpinner, IonText]
})
export class CallbackPage implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  processing = true;
  error = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const authSubscription = this.authService.handleAuthCallback(code).subscribe({
        next: (response) => {
          this.processing = false;
          console.log('Authentication successful');
          this.router.navigate(['/']); // Navigate after successful login
        },
        error: (err) => {
          console.error('Authentication error:', err);
          this.handleError();
        },
        complete: () => {
          console.log('Authentication process completed.');
        }
      });

      this.subscription.add(authSubscription);
    } else {
      console.error('No authorization code found.');
      this.handleError();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Clean up the subscription
  }

  private handleError() {
    this.processing = false;
    this.error = true;
    setTimeout(() => this.router.navigate(['/login']), 5000); // Redirect after some time
  }
}

import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet
  ],
  providers: [
    provideRouter(routes) // Use provideRouter to handle routes
  ]
})
export class AppComponent {
  constructor() {}
}

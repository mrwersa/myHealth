import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { LocaleService } from './services/locale.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private localeService: LocaleService) {
    this.localeService.setLocale('en-GB'); // Set the locale to UK English
  }
}

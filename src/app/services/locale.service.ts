import { Injectable } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEnGb from '@angular/common/locales/en-GB';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private currentLocale: string = 'en-GB';

  constructor() {
    this.setLocale(this.currentLocale);
  }

  setLocale(locale: string) {
    this.currentLocale = locale;
    registerLocaleData(localeEnGb, locale);
  }

  getLocale(): string {
    return this.currentLocale;
  }
}

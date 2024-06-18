import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private dismissSubject = new Subject<void>();
  dismiss$ = this.dismissSubject.asObservable();

  dismissMenu() {
    this.dismissSubject.next();
  }
}

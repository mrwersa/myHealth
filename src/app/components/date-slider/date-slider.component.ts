import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { format, isToday as isTodayFn, isYesterday, subDays } from 'date-fns';
import { addIcons } from 'ionicons';
import { arrowBackCircle, arrowForwardCircle } from 'ionicons/icons';

addIcons({
  'arrow-back-circle': arrowBackCircle,
  'arrow-forward-circle': arrowForwardCircle,
});

@Component({
  selector: 'app-date-slider',
  templateUrl: './date-slider.component.html',
  styleUrls: ['./date-slider.component.scss'],
  standalone: true,
  imports: [IonCardContent, IonCard, CommonModule, IonButton, IonIcon]
})
export class DateSliderComponent {
  @Output() dateChange = new EventEmitter<string>();
  selectedDate = new Date();

  previousDay() {
    this.selectedDate = subDays(this.selectedDate, 1);
    this.emitDateChange();
  }

  nextDay() {
    this.selectedDate = subDays(this.selectedDate, -1);
    this.emitDateChange();
  }

  goToToday() {
    this.selectedDate = new Date();
    this.emitDateChange();
  }

  emitDateChange() {
    this.dateChange.emit(this.selectedDate.toISOString().split('T')[0]);
  }

  isToday() {
    return isTodayFn(this.selectedDate);
  }

  displayDate() {
    if (isTodayFn(this.selectedDate)) {
      return 'Today';
    } else if (isYesterday(this.selectedDate)) {
      return 'Yesterday';
    } else {
      return format(this.selectedDate, 'MMM d, yyyy');
    }
  }
}

import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { format, isToday as isTodayFn, subDays, addDays, subWeeks, addWeeks, subMonths, addMonths, subYears, addYears, startOfWeek, startOfMonth, startOfYear, isSameWeek, isSameMonth, isSameYear, isFuture, min, endOfWeek, endOfMonth, endOfYear } from 'date-fns';
import { addIcons } from 'ionicons';
import { arrowBackCircle, arrowForwardCircle } from 'ionicons/icons';
import { FormatService } from '../../services/format.service';

addIcons({
  'arrow-back-circle': arrowBackCircle,
  'arrow-forward-circle': arrowForwardCircle,
});

@Component({
  selector: 'app-date-navigator',
  templateUrl: './date-navigator.component.html',
  styleUrls: ['./date-navigator.component.scss'],
  standalone: true,
  imports: [IonCardContent, IonCard, CommonModule, IonButton, IonIcon]
})
export class DateNavigatorComponent implements OnInit, OnChanges {
  @Output() dateChange = new EventEmitter<string>();
  @Input() viewMode: 'day' | 'week' | 'month' | 'year' = 'day';  // Use @Input to accept viewMode as input

  selectedDate = new Date();

  constructor(private formatService: FormatService) { }

  ngOnInit() {
    this.updateViewMode();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['viewMode']) {
      this.updateViewMode();
    }
  }

  updateViewMode() {
    this.selectedDate = new Date(); // Reset to today
    this.emitDateChange();
  }

  previous() {
    switch (this.viewMode) {
      case 'day':
        this.selectedDate = subDays(this.selectedDate, 1);
        break;
      case 'week':
        this.selectedDate = subWeeks(this.selectedDate, 1);
        break;
      case 'month':
        this.selectedDate = subMonths(this.selectedDate, 1);
        break;
      case 'year':
        this.selectedDate = subYears(this.selectedDate, 1);
        break;
    }
    this.emitDateChange();
  }

  next() {
    const newDate = this.getNextDate();
    if (!isFuture(newDate)) {
      this.selectedDate = newDate;
      this.emitDateChange();
    }
  }

  getNextDate() {
    switch (this.viewMode) {
      case 'day':
        return addDays(this.selectedDate, 1);
      case 'week':
        return addWeeks(this.selectedDate, 1);
      case 'month':
        return addMonths(this.selectedDate, 1);
      case 'year':
        return addYears(this.selectedDate, 1);
      default:
        return this.selectedDate;
    }
  }

  goToToday() {
    this.updateViewMode();
  }

  emitDateChange() {
    this.dateChange.emit(this.selectedDate.toISOString().split('T')[0]);
  }

  isCurrentPeriod() {
    switch (this.viewMode) {
      case 'day':
        return isTodayFn(this.selectedDate);
      case 'week':
        return isSameWeek(this.selectedDate, new Date(), { weekStartsOn: 1 });
      case 'month':
        return isSameMonth(this.selectedDate, new Date());
      case 'year':
        return isSameYear(this.selectedDate, new Date());
      default:
        return false;
    }
  }

  displayDate() {
    return this.formatService.formatDateForDisplay(this.selectedDate, this.viewMode);
  }
}

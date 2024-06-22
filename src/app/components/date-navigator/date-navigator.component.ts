import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { format, isToday as isTodayFn, subDays, addDays, subWeeks, addWeeks, subMonths, addMonths, subYears, addYears, startOfWeek, startOfMonth, startOfYear, isSameWeek, isSameMonth, isSameYear, isFuture, min, endOfWeek, endOfMonth, endOfYear } from 'date-fns';
import { addIcons } from 'ionicons';
import { arrowBackCircle, arrowForwardCircle, home } from 'ionicons/icons';
import { FormatService } from '../../services/format.service';

addIcons({
  'arrow-back-circle': arrowBackCircle,
  'arrow-forward-circle': arrowForwardCircle,
  'home': home,
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
  @Input() viewMode: 'day' | 'week' | 'month' | 'year' = 'day';
  @Input() selectedDate: string = new Date().toISOString().split('T')[0];  // Use string type for selectedDate

  displayPeriod: string = '';

  constructor(private formatService: FormatService) { }

  ngOnInit() {
    this.updateDisplayPeriod();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['viewMode'] || changes['selectedDate']) {
      this.updateDisplayPeriod();
    }
  }

  previous() {
    if (this.canMoveBack()) {
      let date = new Date(this.selectedDate);
      this.selectedDate = this.getPreviousDate(date).toISOString().split('T')[0];
      this.emitDateChange();
      this.updateDisplayPeriod();
    }
  }

  next() {
    let date = new Date(this.selectedDate);
    const newDate = this.getNextDate(date);

    if (!isFuture(newDate) && newDate <= new Date()) {
      this.selectedDate = newDate.toISOString().split('T')[0];
      this.emitDateChange();
      this.updateDisplayPeriod();
    }
  }

  getNextDate(date: Date): Date {
    switch (this.viewMode) {
      case 'day':
        return addDays(date, 1);
      case 'week':
        return addWeeks(date, 1);
      case 'month':
        return addMonths(date, 1);
      case 'year':
        return addYears(date, 1);
      default:
        return date;
    }
  }

  getPreviousDate(date: Date): Date {
    switch (this.viewMode) {
      case 'day':
        return subDays(date, 1);
      case 'week':
        return subWeeks(date, 1);
      case 'month':
        return subMonths(date, 1);
      case 'year':
        return subYears(date, 1);
      default:
        return date;
    }
  }

  canMoveBack(): boolean {
    const date = new Date(this.selectedDate);
    const startOfCurrentMonth = startOfMonth(new Date());
    const startOfCurrentYear = startOfYear(new Date());
    const twoYearsAgo = subYears(new Date(), 2);

    switch (this.viewMode) {
      case 'day':
      case 'week':
        return date > startOfCurrentMonth;
      case 'month':
        return date > startOfCurrentYear;
      case 'year':
        return date > twoYearsAgo;
      default:
        return true;
    }
  }

  goToCurrentPeriod() {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.emitDateChange();
    this.updateDisplayPeriod();
  }

  emitDateChange() {
    this.dateChange.emit(this.selectedDate);
  }

  isCurrentPeriod(): boolean {
    const date = new Date(this.selectedDate);
    switch (this.viewMode) {
      case 'day':
        return isTodayFn(date);
      case 'week':
        return isSameWeek(date, new Date(), { weekStartsOn: 1 });
      case 'month':
        return isSameMonth(date, new Date());
      case 'year':
        return isSameYear(date, new Date());
      default:
        return false;
    }
  }

  updateDisplayPeriod() {
    const date = new Date(this.selectedDate);
    this.displayPeriod = this.formatService.getFormattedDisplayPeriod(date, this.viewMode);
  }

  getTooltip(): string {
    switch (this.viewMode) {
      case 'day':
        return 'Go to Today';
      case 'week':
        return 'Go to This Week';
      case 'month':
        return 'Go to This Month';
      case 'year':
        return 'Go to This Year';
      default:
        return 'Go to Current Period';
    }
  }
}

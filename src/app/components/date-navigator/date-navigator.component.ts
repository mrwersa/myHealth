import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { format, isToday as isTodayFn, subDays, addDays, subWeeks, addWeeks, subMonths, addMonths, subYears, addYears, startOfWeek, startOfMonth, startOfYear, isSameWeek, isSameMonth, isSameYear, isFuture, min, endOfWeek, endOfMonth, endOfYear, startOfDay } from 'date-fns';
import { addIcons } from 'ionicons';
import { arrowBackCircle, arrowForwardCircle, home } from 'ionicons/icons';
import { FormatService } from '../../services/format.service';
import { LocaleService } from '../../services/locale.service';

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
  @Output() dateChange = new EventEmitter<Date>();
  @Input() viewMode: 'day' | 'week' | 'month' | 'year' = 'day';
  @Input() selectedDate: Date = new Date();

  displayPeriod: string = '';

  constructor(private formatService: FormatService, private localeService: LocaleService) { }

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
      this.selectedDate = this.getPreviousDate(this.selectedDate);
      this.emitDateChange();
      this.updateDisplayPeriod();
    }
  }

  next() {
    const newDate = this.getNextDate(this.selectedDate);

    if (!isFuture(newDate) && newDate <= new Date()) {
      this.selectedDate = newDate;
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
    const startOfCurrentMonth = startOfMonth(new Date());
    const startOfCurrentYear = startOfYear(new Date());
    const twoYearsAgo = startOfYear(subYears(new Date(), 2));

    switch (this.viewMode) {
      case 'day':
        return startOfDay(this.selectedDate) > startOfCurrentMonth;
      case 'week':
        // Check if the start of the week is within the current month
        const startOfCurrentWeek = startOfWeek(this.selectedDate, { weekStartsOn: 1 });
        return startOfCurrentWeek >= startOfCurrentMonth;
      case 'month':
        return startOfMonth(this.selectedDate) > startOfCurrentYear;
      case 'year':
        return startOfYear(this.selectedDate) > twoYearsAgo;
      default:
        return true;
    }
  }

  goToCurrentPeriod() {
    this.selectedDate = new Date();
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
    this.displayPeriod = this.formatService.getFormattedDisplayPeriod(this.selectedDate, this.viewMode);
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

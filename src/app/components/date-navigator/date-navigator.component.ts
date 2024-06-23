import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { format, isToday as isTodayFn, subDays, addDays, subWeeks, addWeeks, subMonths, addMonths, subYears, addYears, startOfWeek, startOfMonth, startOfYear, isSameWeek, isSameMonth, isSameYear, isFuture, min, endOfWeek, endOfMonth, endOfYear, startOfDay, isSameDay } from 'date-fns';
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
  @Input() currentDate: Date = new Date();

  displayPeriod: string = '';
  intercalSelectedDate!: Date;

  constructor(private formatService: FormatService, private localeService: LocaleService) { }

  ngOnInit() {
    this.updateDisplayPeriod();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['viewMode'] || changes['selectedDate']) {
      this.intercalSelectedDate = this.currentDate;
      this.updateDisplayPeriod();
    }
  }

  previous() {
    if (this.canMoveBack()) {
      this.intercalSelectedDate = this.getPreviousDate(this.intercalSelectedDate);
      this.emitDateChange();
      this.updateDisplayPeriod();
    }
  }

  next() {
    const newDate = this.getNextDate(this.intercalSelectedDate);

    if (!isFuture(newDate) && newDate <= new Date()) {
      this.intercalSelectedDate = newDate;
      this.emitDateChange();
      this.updateDisplayPeriod();
    }
  }

  getNextDate(date: Date): Date {
    switch (this.viewMode) {
      case 'day':
        return addDays(date, 1);
      case 'week':
        return min([this.currentDate, endOfWeek(addWeeks(date, 1))]);
      case 'month':
        return min([this.currentDate, endOfMonth(addMonths(date, 1))]);
      case 'year':
        return min([this.currentDate, endOfYear(addYears(date, 1))]);
      default:
        return date;
    }
  }

  getPreviousDate(date: Date): Date {
    switch (this.viewMode) {
      case 'day':
        return subDays(date, 1);
      case 'week':
        return endOfWeek(subWeeks(date, 1));
      case 'month':
        return endOfMonth(subMonths(date, 1));
      case 'year':
        return endOfYear(subYears(date, 1));
      default:
        return date;
    }
  }

  canMoveBack(): boolean {
    const startOfCurrentMonth = startOfMonth(this.currentDate);
    const startOfCurrentYear = startOfYear(this.currentDate);
    const twoYearsAgo = startOfYear(subYears(this.currentDate, 2));

    switch (this.viewMode) {
      case 'day':
        return startOfDay(this.intercalSelectedDate) > startOfCurrentMonth;
      case 'week':
        // Check if the start of the week is within the current month
        const startOfCurrentWeek = startOfWeek(this.intercalSelectedDate, { weekStartsOn: 1 });
        return startOfCurrentWeek >= startOfCurrentMonth;
      case 'month':
        return startOfMonth(this.intercalSelectedDate) > startOfCurrentYear;
      case 'year':
        return startOfYear(this.intercalSelectedDate) > twoYearsAgo;
      default:
        return true;
    }
  }

  goToCurrentPeriod() {
    this.intercalSelectedDate = this.currentDate;
    this.emitDateChange();
    this.updateDisplayPeriod();
  }

  emitDateChange() {
    this.dateChange.emit(this.intercalSelectedDate);
  }

  isCurrentPeriod(): boolean {
    switch (this.viewMode) {
      case 'day':
        return isSameDay(this.intercalSelectedDate, this.currentDate);
      case 'week':
        return isSameWeek(this.intercalSelectedDate, this.currentDate, { weekStartsOn: 1 });
      case 'month':
        return isSameMonth(this.intercalSelectedDate, this.currentDate);
      case 'year':
        return isSameYear(this.intercalSelectedDate, this.currentDate);
      default:
        return false;
    }
  }

  updateDisplayPeriod() {
    this.displayPeriod = this.formatService.getFormattedDisplayPeriod(this.intercalSelectedDate, this.viewMode);
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

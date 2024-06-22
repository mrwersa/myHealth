import { Injectable } from '@angular/core';
import { format, isToday as isTodayFn, isYesterday, startOfMonth, differenceInCalendarWeeks, getYear, startOfWeek, getISOWeek, isSameWeek, isSameMonth, isSameYear } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class FormatService {

  constructor() { }

  formatMetricValue(value: number, metricType: string, metricUnit: string): string {
    switch (metricType) {
      case 'steps':
        return `${Math.round(value).toString()} ${metricUnit}`;
      case 'distance':
        return `${value.toFixed(2)} ${metricUnit}`;
      case 'calories':
      case 'caloriesOut':
      case 'activityCalories':
        return `${Math.round(value).toString()} ${metricUnit}`;
      case 'fairlyActiveMinutes':
      case 'lightlyActiveMinutes':
      case 'sedentaryMinutes':
      case 'veryActiveMinutes':
      case 'sleepMinutes':
      case 'zoneMinutes': // Added this case for zone minutes
        return this.formatTime(value);
      case 'heartRate':
      case 'restingHeartRate':
        return `${Math.round(value).toString()} ${metricUnit}`;
      default:
        return `${value.toFixed(2)} ${metricUnit}`;
    }
  }

  private formatTime(value: number): string {
    const hours = Math.floor(value / 60);
    const minutes = Math.round(value % 60);
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  formatDateForDisplay(date: Date, viewMode: 'day' | 'week' | 'month' | 'year'): string {
    if (isTodayFn(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      switch (viewMode) {
        case 'day':
          return format(date, 'EEE, MMM d, yyyy'); // EEE for day name (short), MMM for month (short), d for day, yyyy for year
        case 'week':
          const startOfCurrentMonth = startOfMonth(date);
          const weekNumber = differenceInCalendarWeeks(date, startOfCurrentMonth) + 1;
          if (isSameWeek(date, new Date(), { weekStartsOn: 1 })) {
            return 'This Week';
          }
          return `Week ${weekNumber}, ${format(date, 'MMM')}`;
        case 'month':
          if (isSameMonth(date, new Date())) {
            return 'This Month';
          }
          return format(date, 'MMMM');
        case 'year':
          if (isSameYear(date, new Date())) {
            return 'This Year';
          }
          return getYear(date).toString();
        default:
          return format(date, 'EEE, MMM d, yyyy');
      }
    }
  }
}

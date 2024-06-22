import { Injectable } from '@angular/core';
import { format, isToday, isYesterday, startOfMonth, differenceInCalendarWeeks, getYear, isSameWeek, isSameMonth, isSameYear } from 'date-fns';

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
      case 'zoneMinutes':
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

  getFormattedDisplayPeriod(date: Date, viewMode: 'day' | 'week' | 'month' | 'year'): string {
    const today = new Date();

    switch (viewMode) {
      case 'day':
        if (isToday(date)) {
          return 'Today';
        } else if (isYesterday(date)) {
          return 'Yesterday';
        } else {
          return format(date, 'EEE, MMM d, yyyy'); // EEE for day name (short), MMM for month (short), d for day, yyyy for year
        }
      case 'week':
        const startOfCurrentMonth = startOfMonth(date);
        const weekNumber = differenceInCalendarWeeks(date, startOfCurrentMonth) + 1;
        if (isSameWeek(date, today, { weekStartsOn: 1 })) {
          return 'This Week';
        }
        return `Week ${weekNumber}, ${format(date, 'MMM')}`;
      case 'month':
        if (isSameMonth(date, today)) {
          return 'This Month';
        }
        return format(date, 'MMMM');
      case 'year':
        if (isSameYear(date, today)) {
          return 'This Year';
        }
        return getYear(date).toString();
      default:
        return format(date, 'EEE, MMM d, yyyy');
    }
  }
}
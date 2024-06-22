import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatService {

  constructor() { }

  formatNumber(value: number, metricType: string): string {
    switch (metricType) {
      case 'steps':
        return Math.round(value).toString();
      case 'distance':
        return value.toFixed(2);
      case 'calories':
      case 'caloriesOut':
      case 'activityCalories':
        return Math.round(value).toString();
      case 'fairlyActiveMinutes':
      case 'lightlyActiveMinutes':
      case 'sedentaryMinutes':
      case 'veryActiveMinutes':
      case 'sleepMinutes':
        return this.formatTime(value);
      case 'heartRate':
      case 'restingHeartRate':
        return Math.round(value).toString();
      default:
        return value.toFixed(2);
    }
  }

  private formatTime(value: number): string {
    const hours = Math.floor(value / 60);
    const minutes = Math.round(value % 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
}

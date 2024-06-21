import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ActivityDetail, ActivityData } from '../models/activity.model';
import { faker } from '@faker-js/faker';

@Injectable({
  providedIn: 'root'
})
export class FitbitService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      this.authService.logout();
      throw new Error('Access token is not available, authentication is required');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
  }

  private generateMockData(): ActivityData {
    return {
      summary: {
        steps: faker.number.int({ min: 5000, max: 12000 }),
        caloriesOut: faker.number.int({ min: 1500, max: 3000 }),
        distances: [
          { activity: 'total', distance: faker.number.float({ min: 5, max: 15 }) },
          { activity: 'tracker', distance: faker.number.float({ min: 2, max: 10 }) }
        ],
        activeMinutes: faker.number.int({ min: 50, max: 200 }),
        fairlyActiveMinutes: faker.number.int({ min: 10, max: 50 }),
        lightlyActiveMinutes: faker.number.int({ min: 20, max: 100 }),
        sedentaryMinutes: faker.number.int({ min: 500, max: 1000 }),
        veryActiveMinutes: faker.number.int({ min: 30, max: 120 }),
        elevation: faker.number.float({ min: 5, max: 20 }),
        floors: faker.number.int({ min: 5, max: 20 }),
        heartRateZones: [
          { name: 'Fat Burn', min: 93, max: 130, minutes: faker.number.int({ min: 20, max: 60 }), caloriesOut: faker.number.int({ min: 100, max: 300 }) },
          { name: 'Cardio', min: 130, max: 160, minutes: faker.number.int({ min: 10, max: 40 }), caloriesOut: faker.number.int({ min: 200, max: 500 }) },
          { name: 'Peak', min: 160, max: 190, minutes: faker.number.int({ min: 5, max: 20 }), caloriesOut: faker.number.int({ min: 300, max: 600 }) }
        ],
        restingHeartRate: faker.number.int({ min: 60, max: 80 }),
        activityCalories: faker.number.int({ min: 2000, max: 3000 }),
        caloriesBMR: faker.number.int({ min: 1200, max: 1800 }),
        marginalCalories: faker.number.int({ min: 100, max: 300 }),
        sleepMinutes: faker.number.int({ min: 300, max: 600 }),
        useEstimation: faker.datatype.boolean()
      },
      goals: {
        steps: 10000,
        caloriesOut: 2500,
        distance: 8,
        activeMinutes: 30,
        floors: 10,
        sleep: 480,
        restingHeartRate: 70
      }
    };
  }

  private generateMockTimeSeriesData(days: number): ActivityData[] {
    return Array.from({ length: days }, () => this.generateMockData());
  }

  fetchActivityAndGoals(date: string): Observable<ActivityData> {
    if (environment.test) {
      return of(this.generateMockData());
    }

    try {
      const headers = this.getHeaders();
      const url = `${environment.fitbitApiBaseUrl}/activities/date/${date}.json`;

      return this.http.get<any>(url, { headers }).pipe(
        map(response => ({
          summary: {
            steps: response.summary.steps,
            caloriesOut: response.summary.caloriesOut,
            distances: response.summary.distances.map((d: any) => ({ activity: d.activity, distance: d.distance })),
            activeMinutes: response.summary.activeMinutes,
            fairlyActiveMinutes: response.summary.fairlyActiveMinutes,
            lightlyActiveMinutes: response.summary.lightlyActiveMinutes,
            sedentaryMinutes: response.summary.sedentaryMinutes,
            veryActiveMinutes: response.summary.veryActiveMinutes,
            elevation: response.summary.elevation,
            floors: response.summary.floors,
            heartRateZones: response.summary.heartRateZones.map((zone: any) => ({
              name: zone.name,
              min: zone.min,
              max: zone.max,
              minutes: zone.minutes,
              caloriesOut: zone.caloriesOut
            })),
            restingHeartRate: response.summary.restingHeartRate,
            activityCalories: response.summary.activityCalories,
            caloriesBMR: response.summary.caloriesBMR,
            marginalCalories: response.summary.marginalCalories,
            useEstimation: response.summary.useEstimation,
            sleepMinutes: response.summary.sleepMinutes
          },
          goals: {
            steps: response.goals.steps,
            caloriesOut: response.goals.caloriesOut,
            distance: response.goals.distance,
            activeMinutes: response.goals.activeMinutes,
            floors: response.goals.floors,
            sleep: response.goals.sleep,
            restingHeartRate: response.goals.restingHeartRate
          }
        })),
        catchError(err => {
          console.error('Error fetching activity and goals:', err);
          return throwError(() => new Error('Failed to fetch activity and goals'));
        })
      );
    } catch (error) {
      console.error(error);
      return throwError(() => new Error('Failed to fetch activity and goals due to authentication issues'));
    }
  }

  fetchActivityTimeSeries(activityType: string, startDate: string, endDate: string): Observable<ActivityData[]> {
    if (environment.test) {
      const mockData = this.generateMockTimeSeriesData(30); // Generate 30 days of data for a more comprehensive dataset
      return of(mockData);
    }

    try {
      const headers = this.getHeaders();
      const url = `${environment.fitbitApiBaseUrl}/activities/${activityType}/date/${startDate}/${endDate}.json`;

      return this.http.get<any>(url, { headers }).pipe(
        map(response => response['activities']), // Adjust this based on the actual structure of the Fitbit API response
        catchError(err => {
          console.error('Error fetching activity time series:', err);
          return throwError(() => new Error('Failed to fetch activity time series'));
        })
      );
    } catch (error) {
      console.error(error);
      return throwError(() => new Error('Failed to fetch activity time series due to authentication issues'));
    }
  }
}

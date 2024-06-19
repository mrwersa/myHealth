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
        steps: faker.datatype.number({ min: 5000, max: 12000 }),
        caloriesOut: faker.datatype.number({ min: 1500, max: 3000 }),
        distances: [
          { activity: 'total', distance: faker.datatype.float({ min: 5, max: 15 }) },
          { activity: 'tracker', distance: faker.datatype.float({ min: 2, max: 10 }) }
        ],
        activeMinutes: faker.datatype.number({ min: 50, max: 200 }),
        fairlyActiveMinutes: faker.datatype.number({ min: 10, max: 50 }),
        lightlyActiveMinutes: faker.datatype.number({ min: 20, max: 100 }),
        sedentaryMinutes: faker.datatype.number({ min: 500, max: 1000 }),
        veryActiveMinutes: faker.datatype.number({ min: 30, max: 120 }),
        elevation: faker.datatype.float({ min: 5, max: 20 }),
        floors: faker.datatype.number({ min: 5, max: 20 }),
        heartRateZones: [
          { name: 'Fat Burn', min: 93, max: 130, minutes: faker.datatype.number({ min: 20, max: 60 }), caloriesOut: faker.datatype.number({ min: 100, max: 300 }) },
          { name: 'Cardio', min: 130, max: 160, minutes: faker.datatype.number({ min: 10, max: 40 }), caloriesOut: faker.datatype.number({ min: 200, max: 500 }) },
          { name: 'Peak', min: 160, max: 190, minutes: faker.datatype.number({ min: 5, max: 20 }), caloriesOut: faker.datatype.number({ min: 300, max: 600 }) }
        ],
        restingHeartRate: faker.datatype.number({ min: 60, max: 80 }),
        activityCalories: faker.datatype.number({ min: 2000, max: 3000 }),
        caloriesBMR: faker.datatype.number({ min: 1200, max: 1800 }),
        marginalCalories: faker.datatype.number({ min: 100, max: 300 }),
        sleepMinutes: faker.datatype.number({ min: 300, max: 600 }),
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
          summary: response.summary,
          goals: response.goals
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

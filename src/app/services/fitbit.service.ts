import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { ActivityDetail, ActivityData, Distance, HeartRateZone } from '../models/activity.model';
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

  private generateMockDistances(): Distance[] {
    return [
      { activity: 'total', distance: faker.datatype.float({ min: 5, max: 15 }) },
      { activity: 'tracker', distance: faker.datatype.float({ min: 2, max: 10 }) },
      { activity: 'loggedActivities', distance: faker.datatype.float({ min: 1, max: 5 }) }
    ];
  }

  private generateMockHeartRateZones(): HeartRateZone[] {
    return [
      { name: 'Fat Burn', min: 120, max: 140, minutes: faker.datatype.number({ min: 10, max: 60 }), caloriesOut: faker.datatype.number({ min: 100, max: 300 }) },
      { name: 'Cardio', min: 140, max: 160, minutes: faker.datatype.number({ min: 5, max: 30 }), caloriesOut: faker.datatype.number({ min: 50, max: 200 }) },
      { name: 'Peak', min: 160, max: 180, minutes: faker.datatype.number({ min: 1, max: 10 }), caloriesOut: faker.datatype.number({ min: 20, max: 100 }) }
    ];
  }

  private generateMockData(): ActivityData {
    return {
      summary: {
        steps: faker.datatype.number({ min: 5000, max: 12000 }),
        caloriesOut: faker.datatype.number({ min: 1500, max: 3000 }),
        distances: this.generateMockDistances(),
        activeMinutes: faker.datatype.number({ min: 50, max: 200 }),
        fairlyActiveMinutes: faker.datatype.number({ min: 20, max: 100 }),
        lightlyActiveMinutes: faker.datatype.number({ min: 30, max: 150 }),
        sedentaryMinutes: faker.datatype.number({ min: 500, max: 1000 }),
        veryActiveMinutes: faker.datatype.number({ min: 10, max: 50 }),
        elevation: faker.datatype.float({ min: 10, max: 50 }),
        floors: faker.datatype.number({ min: 1, max: 20 }),
        heartRateZones: this.generateMockHeartRateZones(),
        restingHeartRate: faker.datatype.number({ min: 60, max: 80 }),
        activityCalories: faker.datatype.number({ min: 1000, max: 2000 }),
        caloriesBMR: faker.datatype.number({ min: 1000, max: 2000 }),
        marginalCalories: faker.datatype.number({ min: 100, max: 500 }),
        useEstimation: faker.datatype.boolean(),
        sleepMinutes: faker.datatype.number({ min: 300, max: 600 })
      },
      goals: {
        steps: 10000,
        caloriesOut: 2500,
        distance: 8,
        activeMinutes: 30,
        floors: 10,
        sleep: 480
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
        map(response => {
          return {
            summary: response.summary,
            goals: response.goals
          };
        }),
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

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { faker } from '@faker-js/faker';
import { ActivityTimeSeries, ActiveZoneMinutes, Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class FitbitService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('Access token is not available, logging out...');
      this.authService.logout();
      throw new Error('Access token is not available, authentication is required');
    }
    console.log('Headers created with token:', token);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
  }

  private generateMockActivityData(): Activity {
    console.log('Generating mock activity data');
    return {
      summary: {
        steps: faker.number.int({ min: 5000, max: 12000 }),
        caloriesOut: faker.number.int({ min: 1500, max: 3000 }),
        distances: [
          { activity: 'total', distance: faker.number.float({ min: 5, max: 15 }) },
          { activity: 'tracker', distance: faker.number.float({ min: 2, max: 10 }) }
        ],
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
        useEstimation: faker.datatype.boolean(),
        sleepMinutes: faker.number.int({ min: 300, max: 600 })
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

  private generateMockTimeSeriesData(startDate: string, endDate: string, activityType: string): ActivityTimeSeries[] {
    console.log(`Generating mock time series data from ${startDate} to ${endDate} for ${activityType}`);
    const data: ActivityTimeSeries[] = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      let value;
      switch (activityType) {
        case 'steps':
          value = faker.number.int({ min: 0, max: 20000 }).toString();
          break;
        case 'distance':
          value = faker.number.float({ min: 0, max: 10, precision: 0.01 }).toFixed(2);
          break;
        case 'floors':
          value = faker.number.int({ min: 0, max: 50 }).toString();
          break;
        case 'elevation':
          value = faker.number.float({ min: 0, max: 1000, precision: 0.01 }).toFixed(2);
          break;
        case 'minutesSedentary':
          value = faker.number.int({ min: 0, max: 1440 }).toString();
          break;
        case 'minutesLightlyActive':
          value = faker.number.int({ min: 0, max: 1440 }).toString();
          break;
        case 'minutesFairlyActive':
          value = faker.number.int({ min: 0, max: 1440 }).toString();
          break;
        case 'minutesVeryActive':
          value = faker.number.int({ min: 0, max: 1440 }).toString();
          break;
        case 'calories':
          value = faker.number.int({ min: 0, max: 5000 }).toString();
          break;
        default:
          value = faker.number.int({ min: 0, max: 100 }).toString();
          break;
      }

      data.push({
        dateTime: currentDate.toISOString().split('T')[0],
        value: value
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }

  private generateMockActiveZoneMinutesTimeSeries(startDate: string, endDate: string): ActiveZoneMinutes[] {
    console.log(`Generating mock active zone minutes time series data from ${startDate} to ${endDate}`);
    const data: ActiveZoneMinutes[] = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      data.push({
        dateTime: currentDate.toISOString().split('T')[0],
        value: {
          activeZoneMinutes: faker.number.int({ min: 0, max: 60 }),
          fatBurnActiveZoneMinutes: faker.number.int({ min: 0, max: 30 }),
        }
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }


  fetchActivityAndGoals(date: string): Observable<any> {
    console.log(`Fetching activity and goals for date: ${date}`);
    if (environment.test) {
      console.log('Environment is set to test, returning mock data');
      return of(this.generateMockActivityData());
    }

    try {
      const headers = this.getHeaders();
      const url = `${environment.fitbitApiBaseUrl}/activities/date/${date}.json`;
      console.log(`Making GET request to URL: ${url}`);

      return this.http.get<any>(url, { headers }).pipe(
        map(response => {
          console.log('Response received:', response);
          return {
            summary: {
              steps: response.summary.steps || 0,
              caloriesOut: response.summary.caloriesOut || 0,
              distances: response.summary.distances?.map((d: any) => ({ activity: d.activity, distance: d.distance || 0 })) || [],
              fairlyActiveMinutes: response.summary.fairlyActiveMinutes || 0,
              lightlyActiveMinutes: response.summary.lightlyActiveMinutes || 0,
              sedentaryMinutes: response.summary.sedentaryMinutes || 0,
              veryActiveMinutes: response.summary.veryActiveMinutes || 0,
              elevation: response.summary.elevation || 0,
              floors: response.summary.floors || 0,
              heartRateZones: response.summary.heartRateZones?.map((zone: any) => ({
                name: zone.name || '',
                min: zone.min || 0,
                max: zone.max || 0,
                minutes: zone.minutes || 0,
                caloriesOut: zone.caloriesOut || 0
              })) || [],
              restingHeartRate: response.summary.restingHeartRate || 0,
              activityCalories: response.summary.activityCalories || 0,
              caloriesBMR: response.summary.caloriesBMR || 0,
              marginalCalories: response.summary.marginalCalories || 0,
              useEstimation: response.summary.useEstimation || false,
              sleepMinutes: response.summary.sleepMinutes || 0
            },
            goals: {
              steps: response.goals.steps || 0,
              caloriesOut: response.goals.caloriesOut || 0,
              distance: response.goals.distance || 0,
              activeMinutes: response.goals.activeMinutes || 0,
              floors: response.goals.floors || 0,
              sleep: response.goals.sleep || 0,
              restingHeartRate: response.goals.restingHeartRate || 0
            }
          };
        }),
        catchError(err => {
          console.error('Error fetching activity and goals:', err);
          return throwError(() => new Error('Failed to fetch activity and goals'));
        })
      );
    } catch (error) {
      console.error('Error in fetchActivityAndGoals:', error);
      return throwError(() => new Error('Failed to fetch activity and goals due to authentication issues'));
    }
  }

  fetchActiveZoneMinutesTimeSeries(startDate: string, endDate: string): Observable<ActiveZoneMinutes[]> {
    console.log(`Fetching active zone minutes time series for start date: ${startDate}, end date: ${endDate}`);
    if (environment.test) {
      console.log('Environment is set to test, returning mock time series data');
      const mockData = this.generateMockActiveZoneMinutesTimeSeries(startDate, endDate);
      return of(mockData);
    }

    try {
      const headers = this.getHeaders();
      const url = `${environment.fitbitApiBaseUrl}/activities/active-zone-minutes/date/${startDate}/${endDate}.json`;
      console.log(`Making GET request to URL: ${url}`);

      return this.http.get<any>(url, { headers }).pipe(
        map(response => {
          console.log('Response received:', response);
          return response['activities-active-zone-minutes'].map((entry: any) => ({
            dateTime: entry.dateTime,
            value: {
              activeZoneMinutes: entry.value.activeZoneMinutes,
              fatBurnActiveZoneMinutes: entry.value.fatBurnActiveZoneMinutes
            }
          }));
        }),
        catchError(err => {
          console.error('Error fetching active zone minutes time series:', err);
          return throwError(() => new Error('Failed to fetch active zone minutes time series'));
        })
      );
    } catch (error) {
      console.error('Error in fetchActiveZoneMinutesTimeSeries:', error);
      return throwError(() => new Error('Failed to fetch active zone minutes time series due to authentication issues'));
    }
  }

  fetchActivityTimeSeries(activityType: string, startDate: string, endDate: string): Observable<ActivityTimeSeries[]> {
    console.log(`Fetching activity time series for type: ${activityType}, start date: ${startDate}, end date: ${endDate}`);
    if (environment.test) {
      console.log('Environment is set to test, returning mock time series data');
      const mockData = this.generateMockTimeSeriesData(startDate, endDate, activityType);
      console.log(mockData)
      return of(mockData);
    }

    const validActivityTypes = ['steps', 'distance', 'floors', 'elevation', 'minutesSedentary', 'minutesLightlyActive', 'minutesFairlyActive', 'minutesVeryActive', 'calories'];

    if (!validActivityTypes.includes(activityType)) {
      return throwError(() => new Error('Invalid activity type'));
    }

    try {
      const headers = this.getHeaders();
      const url = `${environment.fitbitApiBaseUrl}/activities/${activityType}/date/${startDate}/${endDate}.json`;
      console.log(`Making GET request to URL: ${url}`);

      return this.http.get<any>(url, { headers }).pipe(
        map(response => {
          console.log('Response received:', response);
          return response[`activities-${activityType}`].map((item: any) => ({
            dateTime: item.dateTime,
            value: item.value
          }));
        }),
        catchError(err => {
          console.error('Error fetching activity time series:', err);
          return throwError(() => new Error('Failed to fetch activity time series'));
        })
      );
    } catch (error) {
      console.error('Error in fetchActivityTimeSeries:', error);
      return throwError(() => new Error('Failed to fetch activity time series due to authentication issues'));
    }
  }
}


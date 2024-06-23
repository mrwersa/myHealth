import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton, IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DateNavigatorComponent } from '../../components/date-navigator/date-navigator.component';
import { ActivityProgressComponent } from '../../components/activity-progress/activity-progress.component';
import { ActivityReportComponent } from '../../components/activity-report/activity-report.component';
import { FitbitService } from '../../services/fitbit.service';
import { ActivityDetail, Activity, ActiveZoneMinutes } from '../../models/activity.model';
import { FormatService } from '../../services/format.service';
import { Subscription } from 'rxjs';
import { LocaleService } from '../../services/locale.service';
import { isToday } from 'date-fns';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  standalone: true,
  imports: [
    IonButton, IonIcon, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent, CommonModule, FormsModule,
    DateNavigatorComponent, ActivityProgressComponent, ActivityReportComponent
  ]
})
export class ActivityPage implements OnInit, OnDestroy {
  metrics: ActivityDetail[] = [];
  currentMetricIndex = 0;
  selectedDate: Date = new Date();
  private subscriptions: Subscription = new Subscription();

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild(IonRefresher) refresher!: IonRefresher;

  get currentMetric(): ActivityDetail {
    return this.metrics[this.currentMetricIndex] || {
      title: '', value: 0, goal: 0, unit: '', icon: '',
      goalAchieved: false, details: '', type: ''
    };
  }

  constructor(private fitbitService: FitbitService, private formatService: FormatService, private localeService: LocaleService) { }

  ngOnInit() {
    this.loadMetrics();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadMetrics() {
    if (this.selectedDate) {
      const startDateIsoStr = this.selectedDate.toISOString().split('T')[0];
      const subscription = this.fitbitService.fetchActivityAndGoals(startDateIsoStr).subscribe({
        next: (data) => {
          this.metrics = this.mapActivityDataToMetrics(data);
          // Fetch Zone Minutes separately
          this.loadZoneMinutesMetric(data.goals.activeMinutes);
          if (this.refresher) {
            setTimeout(() => {
              this.refresher.complete(); // Complete the refresher with a delay
            }, 1000); // Adjust the delay as needed
          }
        },
        error: (err) => {
          console.error('Error fetching activity data:', err);
          if (this.refresher) {
            setTimeout(() => {
              this.refresher.complete(); // Complete the refresher in case of error with a delay
            }, 1000); // Adjust the delay as needed
          }
        }
      });
      this.subscriptions.add(subscription);
    }
  }

  loadZoneMinutesMetric(activeMinutesGoal: number) {
    const endDate = this.selectedDate;
    const endDateIsoStr = new Date(endDate).toISOString().split('T')[0];
    const startDateIsoStr = this.selectedDate.toISOString().split('T')[0];
    const zoneMinutesSubscription = this.fitbitService.fetchActiveZoneMinutesTimeSeries(startDateIsoStr, endDateIsoStr).subscribe({
      next: (zoneMinutesData) => {
        const zoneMinutes = this.calculateZoneMinutes(zoneMinutesData.map(entry => ({
          ...entry,
          dateTime: new Date(entry.dateTime).toLocaleDateString(this.localeService.getLocale())
        })));
        const zoneMinutesMetric = this.createMetricDetail('Zone Minutes', 'zoneMinutes', 'timer-outline', zoneMinutes, activeMinutesGoal, 'min');
        this.metrics.push(zoneMinutesMetric);
      },
      error: (err) => console.error('Error fetching zone minutes data:', err)
    });
    this.subscriptions.add(zoneMinutesSubscription);
  }


  mapActivityDataToMetrics(data: Activity): ActivityDetail[] {
    if (!data || !data.summary) return [];

    return [
      this.createMetricDetail('Steps', 'steps', 'walk-outline', data.summary.steps, data.goals.steps, 'steps'),
      this.createMetricDetail('Calories', 'caloriesOut', 'flame-outline', data.summary.caloriesOut, data.goals.caloriesOut, 'cal'),
      this.createMetricDetail('Distance', 'distance', 'bicycle-outline', this.calculateTotalDistance(data.summary.distances), data.goals.distance, 'km')
      // Zone Minutes will be added after fetching the data
    ];
  }

  createMetricDetail(title: string, type: string, icon: string, value: number | undefined, goal: number | undefined, unit: string): ActivityDetail {
    const goalAchieved = (value ?? 0) >= (goal ?? 0);
    let details = '';

    if (value !== undefined) {
      if (goalAchieved) {
        details = isToday(this.selectedDate)
          ? `Great job! You've achieved your ${title.toLowerCase()} goal for today with ${this.formatService.formatMetricValue(value, type, unit)}.`
          : `Great job! You achieved your ${title.toLowerCase()} goal with ${this.formatService.formatMetricValue(value, type, unit)}.`;
      } else {
        const remaining = (goal ?? 0) - (value ?? 0);
        switch (type) {
          case 'steps':
            details = isToday(this.selectedDate)
              ? `You have ${this.formatService.formatMetricValue(remaining, type, unit)} left to reach your step goal for today.`
              : `You had ${this.formatService.formatMetricValue(remaining, type, unit)} left to reach your step goal.`;
            break;
          case 'caloriesOut':
            details = isToday(this.selectedDate)
              ? `You need to burn ${this.formatService.formatMetricValue(remaining, type, unit)} more to reach your calorie goal for today.`
              : `You needed to burn ${this.formatService.formatMetricValue(remaining, type, unit)} more to reach your calorie goal.`;
            break;
          case 'distance':
            details = isToday(this.selectedDate)
              ? `You have ${this.formatService.formatMetricValue(remaining, type, unit)} left to cover to reach your distance goal for today.`
              : `You had ${this.formatService.formatMetricValue(remaining, type, unit)} left to cover to reach your distance goal.`;
            break;
          case 'zoneMinutes':
            details = isToday(this.selectedDate)
              ? `You have ${this.formatService.formatMetricValue(remaining, type, unit)} left to achieve your active zone minutes goal for today.`
              : `You had ${this.formatService.formatMetricValue(remaining, type, unit)} left to achieve your active zone minutes goal.`;
            break;
          default:
            details = isToday(this.selectedDate)
              ? `You have ${this.formatService.formatMetricValue(remaining, type, unit)} left to achieve your ${title.toLowerCase()} goal for today.`
              : `You had ${this.formatService.formatMetricValue(remaining, type, unit)} left to achieve your ${title.toLowerCase()} goal.`;
        }
      }
    } else {
      details = `No data available for ${title.toLowerCase()}.`;
    }

    return {
      title,
      value: value ?? 0,
      goal: goal ?? 0,
      unit,
      icon,
      goalAchieved,
      details,
      type
    };
  }

  calculateZoneMinutes(zoneMinutesData: ActiveZoneMinutes[]): number {
    if (!zoneMinutesData || zoneMinutesData.length === 0) {
      return 0;
    }
    const moderateZone = zoneMinutesData.find(zone => zone.dateTime === this.selectedDate.toISOString().split('T')[0]);
    return moderateZone ? moderateZone.value.activeZoneMinutes : 0;
  }

  calculateTotalDistance(distances: { activity: string, distance: number }[]): number {
    return distances.reduce((sum, d) => sum + d.distance, 0);
  }

  getCurrentDateString(): string {
    const today = new Date();
    return today.toLocaleDateString(this.localeService.getLocale())
  }

  onDateChange(event: any) {
    this.selectedDate = event;
    this.loadMetrics();
  }

  prevMetric() {
    if (this.currentMetricIndex > 0) {
      this.currentMetricIndex--;
    }
  }

  nextMetric() {
    if (this.currentMetricIndex < this.metrics.length - 1) {
      this.currentMetricIndex++;
    }
  }

  onScroll(event: any) {
    const threshold = 100;
    this.content.getScrollElement().then(el => {
      const position = el.scrollTop;
      if (position > threshold) {
        this.loadMetrics();
      }
    });
  }

  refreshData(event: any) {
    this.loadMetrics();
    setTimeout(() => {
      this.refresher.complete();
    }, 2000);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DateNavigatorComponent } from '../../components/date-navigator/date-navigator.component';
import { ActivityProgressComponent } from '../../components/activity-progress/activity-progress.component';
import { ActivityReportComponent } from '../../components/activity-report/activity-report.component';
import { FitbitService } from '../../services/fitbit.service';
import { ActivityDetail, Activity, ActiveZoneMinutes } from '../../models/activity.model';
import { FormatService } from '../../services/format.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  standalone: true,
  imports: [
    IonButton, IonIcon, IonContent, CommonModule, FormsModule,
    DateNavigatorComponent, ActivityProgressComponent, ActivityReportComponent
  ]
})
export class ActivityPage implements OnInit, OnDestroy {
  metrics: ActivityDetail[] = [];
  currentMetricIndex = 0;
  selectedDate: string = this.getCurrentDateString();
  private subscriptions: Subscription = new Subscription();

  get currentMetric(): ActivityDetail {
    return this.metrics[this.currentMetricIndex] || {
      title: '', value: 0, goal: 0, unit: '', icon: '',
      goalAchieved: false, details: '', type: ''
    };
  }

  constructor(private fitbitService: FitbitService, private formatService: FormatService) { }

  ngOnInit() {
    this.loadMetrics();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadMetrics() {
    if (this.selectedDate) {
      const subscription = this.fitbitService.fetchActivityAndGoals(this.selectedDate).subscribe({
        next: (data) => {
          this.metrics = this.mapActivityDataToMetrics(data);
          // Fetch Zone Minutes separately
          const zoneMinutesSubscription = this.fitbitService.fetchActiveZoneMinutesTimeSeries(this.selectedDate, this.selectedDate).subscribe({
            next: (zoneMinutesData) => {
              const zoneMinutes = this.calculateZoneMinutes(zoneMinutesData);
              const zoneMinutesMetric = this.createMetricDetail('Zone Minutes', 'zoneMinutes', 'timer-outline', zoneMinutes, data.goals.activeMinutes, 'min');
              this.metrics.push(zoneMinutesMetric);
            },
            error: (err) => console.error('Error fetching zone minutes data:', err)
          });
          this.subscriptions.add(zoneMinutesSubscription);
        },
        error: (err) => console.error('Error fetching activity data:', err)
      });
      this.subscriptions.add(subscription);
    }
  }

  loadZoneMinutesMetric(activeMinutesGoal: number) {
    const endDate = this.selectedDate || this.getCurrentDateString();
    const zoneMinutesSubscription = this.fitbitService.fetchActiveZoneMinutesTimeSeries(this.selectedDate, endDate).subscribe({
      next: (zoneMinutesData) => {
        const zoneMinutes = this.calculateZoneMinutes(zoneMinutesData);
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
    return {
      title,
      value: value ?? 0,
      goal: goal ?? 0,
      unit,
      icon,
      goalAchieved: (value ?? 0) >= (goal ?? 0),
      details: value !== undefined ? `You have ${title.toLowerCase()} ${this.formatService.formatNumber(value, type)} ${unit}.` : `No data available for ${title.toLowerCase()}.`,
      type
    };
  }

  calculateZoneMinutes(zoneMinutesData: ActiveZoneMinutes[]): number {
    if (!zoneMinutesData || zoneMinutesData.length === 0) {
      return 0;
    }
    const moderateZone = zoneMinutesData.find(zone => zone.dateTime === this.selectedDate);
    return moderateZone ? parseFloat(moderateZone.value.activeZoneMinutes.toString()) : 0;
  }

  calculateTotalDistance(distances: { activity: string, distance: number }[]): number {
    return distances.reduce((sum, d) => sum + d.distance, 0);
  }

  getCurrentDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  onDateChange(event: any) {
    this.selectedDate = event;
    this.loadMetrics();
  }

  prevMetric() {
    if (this.currentMetricIndex > 0) this.currentMetricIndex--;
  }

  nextMetric() {
    if (this.currentMetricIndex < this.metrics.length - 1) this.currentMetricIndex++;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DateSliderComponent } from '../../components/date-slider/date-slider.component';
import { MetricChartComponent } from '../../components/metric-chart/metric-chart.component';
import { MetricInfoComponent } from '../../components/metric-info/metric-info.component';
import { FitbitService } from '../../services/fitbit.service';
import { ActivityDetail } from '../../models/activity.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
  standalone: true,
  imports: [
    IonButton, IonIcon, IonContent, CommonModule, FormsModule,
    DateSliderComponent, MetricChartComponent, MetricInfoComponent
  ]
})
export class OverviewPage implements OnInit {
  metrics: ActivityDetail[] = [];
  currentMetricIndex = 0;
  selectedDate: string = this.getCurrentDateString();

  get currentMetric(): ActivityDetail | null {
    return this.metrics.length > 0 ? this.metrics[this.currentMetricIndex] : null;
  }

  constructor(private fitbitService: FitbitService) { }

  ngOnInit() {
    this.loadMetrics();
  }

  loadMetrics() {
    const date = this.selectedDate;
    this.fitbitService.fetchActivityAndGoals(date).subscribe(data => {
      this.metrics = this.mapActivityDataToMetrics(data);
      if (this.metrics.length > 0) {
        this.currentMetricIndex = 0;
      }
    });
  }

  mapActivityDataToMetrics(data: any): ActivityDetail[] {
    return [
      {
        title: 'Steps',
        value: data.summary.steps || 0,
        goal: data.goals.steps || 0,
        unit: 'steps',
        icon: 'walk-outline',
        goalAchieved: (data.summary.steps || 0) >= (data.goals.steps || 0),
        details: `You have walked ${data.summary.steps} steps today.`,
        type: 'steps'
      },
      {
        title: 'Calories',
        value: data.summary.caloriesOut || 0,
        goal: data.goals.caloriesOut || 0,
        unit: 'cal',
        icon: 'flame-outline',
        goalAchieved: (data.summary.caloriesOut || 0) >= (data.goals.caloriesOut || 0),
        details: `You have burned ${data.summary.caloriesOut} calories today.`,
        type: 'caloriesOut'
      },
      {
        title: 'Distance',
        value: (data.summary.distances && data.summary.distances[0] ? data.summary.distances[0].distance : 0),
        goal: data.goals.distance || 0,
        unit: 'km',
        icon: 'bicycle-outline',
        goalAchieved: (data.summary.distances && data.summary.distances[0] ? data.summary.distances[0].distance : 0) >= (data.goals.distance || 0),
        details: `You have covered a distance of ${(data.summary.distances && data.summary.distances[0] ? data.summary.distances[0].distance : 0)} km today.`,
        type: 'distance'
      },
      {
        title: 'Active Minutes',
        value: data.summary.activeMinutes || 0,
        goal: data.goals.activeMinutes || 0,
        unit: 'min',
        icon: 'timer-outline',
        goalAchieved: (data.summary.activeMinutes || 0) >= (data.goals.activeMinutes || 0),
        details: `You have been active for ${data.summary.activeMinutes} minutes today.`,
        type: 'activeMinutes'
      },
      {
        title: 'Sleep',
        value: data.summary.sleepMinutes || 0,
        goal: data.goals.sleep || 0,
        unit: 'h',
        icon: 'bed-outline',
        goalAchieved: (data.summary.sleepMinutes || 0) >= (data.goals.sleep || 0),
        details: `You have slept for ${(data.summary.sleepMinutes || 0) / 60} hours today.`,
        type: 'sleepMinutes'
      }
    ];
  }

  getCurrentDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  onDateChange(event: any) {
    console.log(event);
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
}

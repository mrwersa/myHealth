import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { DateSliderComponent } from '../../components/date-slider/date-slider.component';
import { MetricChartComponent } from '../../components/metric-chart/metric-chart.component';
import { MetricInfoComponent } from '../../components/metric-info/metric-info.component';
import { FitbitService } from '../../services/fitbit.service';
import { ActivityDetail, ActivityData } from '../../models/activity.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonContent, CommonModule, FormsModule, DateSliderComponent, MetricChartComponent, MetricInfoComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OverviewPage implements OnInit {
  metrics: ActivityDetail[] = [];
  currentMetricIndex = 0;
  selectedDate: string = this.getCurrentDateString();

  get currentMetric(): ActivityDetail {
    return this.metrics[this.currentMetricIndex];
  }

  constructor(private fitbitService: FitbitService) { }

  ngOnInit() {
    this.loadMetrics();
  }

  loadMetrics() {
    this.fitbitService.fetchActivityAndGoals(this.selectedDate).subscribe(data => {
      this.metrics = this.mapActivityDataToMetrics(data);
    });
  }

  mapActivityDataToMetrics(data: ActivityData): ActivityDetail[] {
    return [
      {
        title: 'Steps',
        value: data.summary.steps,
        goal: data.goals.steps,
        unit: 'steps',
        icon: 'walk-outline',
        goalAchieved: data.summary.steps >= data.goals.steps,
        details: `You have walked ${data.summary.steps} steps today.`,
        type: 'steps'
      },
      {
        title: 'Calories',
        value: data.summary.caloriesOut,
        goal: data.goals.caloriesOut,
        unit: 'cal',
        icon: 'flame-outline',
        goalAchieved: data.summary.caloriesOut >= data.goals.caloriesOut,
        details: `You have burned ${data.summary.caloriesOut} calories today.`,
        type: 'caloriesOut'
      },
      {
        title: 'Distance',
        value: data.summary.distances[0].distance,
        goal: data.goals.distance,
        unit: 'km',
        icon: 'bicycle-outline',
        goalAchieved: data.summary.distances[0].distance >= data.goals.distance,
        details: `You have covered a distance of ${data.summary.distances[0].distance} km today.`,
        type: 'distance'
      },
      {
        title: 'Active Minutes',
        value: data.summary.activeMinutes,
        goal: data.goals.activeMinutes,
        unit: 'min',
        icon: 'timer-outline',
        goalAchieved: data.summary.activeMinutes >= data.goals.activeMinutes,
        details: `You have been active for ${data.summary.activeMinutes} minutes today.`,
        type: 'activeMinutes'
      },
      {
        title: 'Sleep',
        value: data.summary.sleepMinutes,
        goal: data.goals.sleep,
        unit: 'h',
        icon: 'bed-outline',
        goalAchieved: data.summary.sleepMinutes >= data.goals.sleep,
        details: `You have slept for ${data.summary.sleepMinutes / 60} hours today.`,
        type: 'sleepMinutes'
      },
      {
        title: 'Heart Rate',
        value: data.summary.restingHeartRate!,
        goal: data.goals.restingHeartRate!,
        unit: 'bpm',
        icon: 'heart-outline',
        goalAchieved: data.summary.restingHeartRate! <= data.goals.restingHeartRate!,
        details: `Your resting heart rate is ${data.summary.restingHeartRate} bpm today.`,
        type: 'restingHeartRate'
      }
    ];
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

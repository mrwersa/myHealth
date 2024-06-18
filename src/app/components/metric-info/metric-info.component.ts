import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import { FitbitService } from '../../services/fitbit.service';
import { ActivityData, Distance, HeartRateZone } from '../../models/activity.model';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-metric-info',
  templateUrl: './metric-info.component.html',
  styleUrls: ['./metric-info.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, BaseChartDirective]
})
export class MetricInfoComponent implements OnInit, OnChanges {
  @Input() details!: string;
  @Input() metricType!: string;
  @Input() selectedDate!: string;
  detailedData: any[] = [];
  averageLastWeek!: number;
  averageLastMonth!: number;
  totalLastMonth!: number;
  bestMetricValue!: number;
  heartRateZones: HeartRateZone[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Chart configuration
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {},
      y: { beginAtZero: true }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Value' }
    ]
  };

  constructor(private fitbitService: FitbitService) { }

  ngOnInit() {
    this.fetchDetailedData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['metricType'] && !changes['metricType'].firstChange) {
      this.fetchDetailedData();
    }
    if (changes['selectedDate'] && !changes['selectedDate'].firstChange) {
      this.fetchDetailedData();
    }
  }

  fetchDetailedData() {
    const endDate = this.selectedDate || new Date().toISOString().split('T')[0];
    const startDateWeek = new Date(new Date(endDate).setDate(new Date(endDate).getDate() - 7)).toISOString().split('T')[0];
    const startDateMonth = new Date(new Date(endDate).setMonth(new Date(endDate).getMonth() - 1)).toISOString().split('T')[0];

    this.fitbitService.fetchActivityTimeSeries(this.metricType, startDateWeek, endDate).subscribe((data: any[]) => {
      this.detailedData = data;
      this.averageLastWeek = this.calculateAverage(data);
      this.updateChartData(data, 'lastWeek');
    });

    this.fitbitService.fetchActivityTimeSeries(this.metricType, startDateMonth, endDate).subscribe((data: any[]) => {
      this.averageLastMonth = this.calculateAverage(data);
      this.totalLastMonth = this.calculateTotal(data);
      this.bestMetricValue = this.calculateBestMetricValue(data);
      this.updateChartData(data, 'lastMonth');
    });

    if (this.metricType === 'heartRateZones') {
      this.fitbitService.fetchActivityTimeSeries('heartRateZones', startDateMonth, endDate).subscribe((data: any[]) => {
        this.heartRateZones = data.map(entry => entry.summary?.heartRateZones || []);
      });
    }
  }

  calculateAverage(data: any[]): number {
    const total = data.reduce((sum, entry) => sum + (entry.summary?.[this.metricType] || 0), 0);
    return total / data.length;
  }

  calculateTotal(data: any[]): number {
    return data.reduce((sum, entry) => sum + (entry.summary?.[this.metricType] || 0), 0);
  }

  calculateBestMetricValue(data: any[]): number {
    return Math.max(...data.map(entry => entry.summary?.[this.metricType] || 0));
  }

  updateChartData(data: any[], period: string) {
    if (period === 'lastWeek' || period === 'lastMonth') {
      this.barChartData.labels = data.map(entry => entry.date);
      this.barChartData.datasets[0].data = data.map(entry => entry.summary?.[this.metricType] || 0);
    }
    this.chart?.update();
  }

  getMetricLabel(metricType: string): string {
    const labels: { [key: string]: string } = {
      steps: 'Steps',
      caloriesOut: 'Calories Burned',
      distances: 'Distance (km)',
      activeMinutes: 'Active Minutes',
      fairlyActiveMinutes: 'Fairly Active Minutes',
      lightlyActiveMinutes: 'Lightly Active Minutes',
      sedentaryMinutes: 'Sedentary Minutes',
      veryActiveMinutes: 'Very Active Minutes',
      elevation: 'Elevation (m)',
      floors: 'Floors',
      heartRateZones: 'Heart Rate Zones',
      restingHeartRate: 'Resting Heart Rate (bpm)',
      activityCalories: 'Activity Calories',
      caloriesBMR: 'Calories BMR',
      marginalCalories: 'Marginal Calories',
      useEstimation: 'Use Estimation',
      sleepMinutes: 'Sleep Minutes'
    };
    return labels[metricType] || 'Value';
  }

  getMetricUnit(metricType: string): string {
    const units: { [key: string]: string } = {
      steps: 'steps',
      caloriesOut: 'calories',
      distances: 'km',
      activeMinutes: 'min',
      fairlyActiveMinutes: 'min',
      lightlyActiveMinutes: 'min',
      sedentaryMinutes: 'min',
      veryActiveMinutes: 'min',
      elevation: 'm',
      floors: 'floors',
      heartRateZones: 'zones',
      restingHeartRate: 'bpm',
      activityCalories: 'calories',
      caloriesBMR: 'calories',
      marginalCalories: 'calories',
      useEstimation: 'boolean',
      sleepMinutes: 'min'
    };
    return units[metricType] || 'units';
  }

  getMetricTitle(metricType: string): string {
    const titles: { [key: string]: string } = {
      steps: 'Steps',
      caloriesOut: 'Calories Burned',
      distances: 'Distance',
      activeMinutes: 'Active Minutes',
      fairlyActiveMinutes: 'Fairly Active Minutes',
      lightlyActiveMinutes: 'Lightly Active Minutes',
      sedentaryMinutes: 'Sedentary Minutes',
      veryActiveMinutes: 'Very Active Minutes',
      elevation: 'Elevation',
      floors: 'Floors',
      heartRateZones: 'Heart Rate Zones',
      restingHeartRate: 'Resting Heart Rate',
      activityCalories: 'Activity Calories',
      caloriesBMR: 'Calories BMR',
      marginalCalories: 'Marginal Calories',
      useEstimation: 'Use Estimation',
      sleepMinutes: 'Sleep Minutes'
    };
    return titles[metricType] || 'Metric';
  }

  formatNumber(value: number, metricType: string): string {
    if (metricType === 'distances') {
      return value.toFixed(2);
    } else if (metricType === 'elevation') {
      return value.toFixed(1);
    } else if (metricType.includes('Minutes')) {
      return value.toFixed(0);
    } else {
      return value.toLocaleString();
    }
  }
}

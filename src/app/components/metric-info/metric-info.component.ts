import { Component, Input, OnChanges, SimpleChanges, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import { FitbitService } from '../../services/fitbit.service';
import { ActivityData, Distance, HeartRateZone } from '../../models/activity.model';

@Component({
  selector: 'app-metric-info',
  templateUrl: './metric-info.component.html',
  styleUrls: ['./metric-info.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, BaseChartDirective]
})
export class MetricInfoComponent implements OnChanges, OnInit {
  @Input() details!: string;
  @Input() metricType!: string;
  @Input() selectedDate!: string;
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      annotation: {
        annotations: {
          goalLine: {
            type: 'line',
            scaleID: 'y',
            value: 0, // this will be updated dynamically
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--goal-line-color'),
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: 'Goal',
              position: 'end',
              display: true
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  barChartType: ChartType = 'bar';
  barChartLabels: string[] = [];
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: (context: any) => {
          const value = context.raw;
          const goalValue = this.goal;
          return value >= goalValue ? getComputedStyle(document.documentElement).getPropertyValue('--achieved-color') : getComputedStyle(document.documentElement).getPropertyValue('--not-achieved-color');
        }
      }
    ]
  };
  heartRateZones: HeartRateZone[] = [];

  averageLastWeek: number = 0;
  averageLastMonth: number = 0;
  totalLastMonth: number = 0;
  bestMetric: number = 0;
  goal: number = 0;
  metricValue: number = 0;

  constructor(private fitbitService: FitbitService) { }

  ngOnInit() {
    this.fetchDetailedData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['metricType'] && !changes['metricType'].firstChange) || (changes['selectedDate'] && !changes['selectedDate'].firstChange)) {
      this.fetchDetailedData();
    }
  }

  fetchDetailedData() {
    const endDate = this.selectedDate || new Date().toISOString().split('T')[0];
    const startDateWeek = new Date(new Date(endDate).setDate(new Date(endDate).getDate() - 7)).toISOString().split('T')[0];
    const startDateMonth = new Date(new Date(endDate).setMonth(new Date(endDate).getMonth() - 1)).toISOString().split('T')[0];

    this.fitbitService.fetchActivityTimeSeries(this.metricType, startDateWeek, endDate).subscribe((data: ActivityData[]) => {
      this.updateChart(data);
      this.averageLastWeek = this.calculateAverage(data);
    });

    this.fitbitService.fetchActivityTimeSeries(this.metricType, startDateMonth, endDate).subscribe((data: ActivityData[]) => {
      this.averageLastMonth = this.calculateAverage(data);
      this.totalLastMonth = this.calculateTotal(data);
      this.bestMetric = this.calculateBest(data);
      this.goal = this.getGoalValue(data[0]);
      this.metricValue = this.getMetricValue(data[0]);

      if (this.metricType === 'restingHeartRate') {
        this.heartRateZones = data[0].summary.heartRateZones || [];
      } else {
        this.heartRateZones = [];
      }

      if (this.barChartOptions.plugins?.annotation?.annotations) {
        (this.barChartOptions.plugins.annotation.annotations as any).goalLine.value = this.goal;
      }
    });
  }

  updateChart(data: ActivityData[]) {
    this.barChartLabels = data.map((entry, index) => `Day ${index + 1}`);
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [
        {
          data: data.map(entry => this.getMetricValue(entry)),
          backgroundColor: (context: any) => {
            const value = context.raw;
            const goalValue = this.goal;
            return value >= goalValue ? getComputedStyle(document.documentElement).getPropertyValue('--achieved-color') : getComputedStyle(document.documentElement).getPropertyValue('--not-achieved-color');
          }
        }
      ]
    };
    if (this.chart) {
      this.chart.update();
    }
  }

  calculateAverage(data: ActivityData[]): number {
    const total = data.reduce((sum, entry) => sum + this.getMetricValue(entry), 0);
    return parseFloat((total / data.length).toFixed(2));
  }

  calculateTotal(data: ActivityData[]): number {
    const total = data.reduce((sum, entry) => sum + this.getMetricValue(entry), 0);
    return parseFloat(total.toFixed(2));
  }

  calculateBest(data: ActivityData[]): number {
    return Math.max(...data.map(entry => this.getMetricValue(entry)));
  }

  getGoalValue(data: ActivityData): number {
    const goalValue = data.goals[this.metricType as keyof ActivityData['goals']];
    return goalValue !== undefined ? goalValue : 0;
  }

  getMetricValue(data: ActivityData): number {
    const metricValue = data.summary[this.metricType as keyof ActivityData['summary']];
    if (Array.isArray(metricValue)) {
      if (this.metricType === 'distance') {
        return (metricValue as Distance[]).reduce((sum, distance) => sum + distance.distance, 0);
      }
      return 0;
    }
    return metricValue !== undefined && typeof metricValue === 'number' ? metricValue : 0;
  }

  formatNumber(value: number, metricType: string): string {
    if (metricType === 'steps') {
      return Math.round(value).toString();
    }
    if (metricType === 'distance') {
      return value.toFixed(2);
    }
    return value.toFixed(2);
  }

  getUnit(metricType: string): string {
    const units: { [key: string]: string } = {
      steps: 'steps',
      caloriesOut: 'cal',
      distance: 'km',
      activeMinutes: 'min',
      sleepMinutes: 'h',
      restingHeartRate: 'bpm'
    };
    return units[metricType] || '';
  }

  getFormattedMetricType(): string {
    const formattedMetricTypes: { [key: string]: string } = {
      steps: 'Steps',
      caloriesOut: 'Calories Out',
      distance: 'Distance',
      activeMinutes: 'Active Minutes',
      sleepMinutes: 'Sleep Minutes',
      restingHeartRate: 'Resting Heart Rate'
    };
    return formattedMetricTypes[this.metricType] || this.metricType;
  }
}

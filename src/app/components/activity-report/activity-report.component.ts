import { Component, Input, OnChanges, SimpleChanges, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { IonCard, IonCardContent, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { FitbitService } from '../../services/fitbit.service';
import { FormatService } from '../../services/format.service';
import { ActivityDetail, ActiveZoneMinutes, ActivityTimeSeries, Activity } from '../../models/activity.model';
import { SegmentChangeEventDetail } from '@ionic/core';

type SegmentValue = 'day' | 'week' | 'month' | 'year';

@Component({
  selector: 'app-activity-report',
  templateUrl: './activity-report.component.html',
  styleUrls: ['./activity-report.component.scss'],
  standalone: true,
  imports: [IonLabel, CommonModule, IonCard, IonCardContent, BaseChartDirective, IonSegment, IonSegmentButton]
})
export class ActivityReportComponent implements OnChanges, OnInit {
  @Input() metric!: ActivityDetail;
  @Input() selectedDate!: string;
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  view: SegmentValue = 'day';

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
            value: 0,
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
    datasets: []
  };

  bestMetric: number = 0;
  metricValue: number = 0;

  constructor(private fitbitService: FitbitService, private formatService: FormatService) { }

  ngOnInit() {
    if (this.metric && this.selectedDate) {
      this.checkAndLoadReportData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['metric'] && this.metric) || (changes['selectedDate'] && this.selectedDate)) {
      this.checkAndLoadReportData();
    }
  }

  changeView(event: CustomEvent<SegmentChangeEventDetail>) {
    const value = event.detail.value as SegmentValue;
    this.view = value;
    this.checkAndLoadReportData(); // Ensure data is re-fetched or re-processed
  }

  checkAndLoadReportData() {
    if (this.metric && this.selectedDate) {
      if (this.view !== 'day') {
        this.loadReportData(); // Ensure data is fetched only for non-day views
      }
    }
  }

  loadReportData() {
    const endDate = this.selectedDate || new Date().toISOString().split('T')[0];
    let startDate: string;

    if (this.view === 'week') {
      startDate = new Date(new Date(endDate).setDate(new Date(endDate).getDate() - 6)).toISOString().split('T')[0];
    } else if (this.view === 'month') {
      startDate = new Date(new Date(endDate).setDate(1)).toISOString().split('T')[0];
    } else if (this.view === 'year') {
      const currentYear = new Date().getFullYear();
      startDate = new Date(currentYear, 0, 1).toISOString().split('T')[0];
    } else {
      return; // Do not load data for the day view
    }

    const activityType = this.mapMetricToActivityType(this.metric.type);
    if (activityType) {
      if (this.metric.type === 'zoneMinutes') {
        // Fetch data for active zone minutes
        this.fitbitService.fetchActiveZoneMinutesTimeSeries(startDate, endDate).subscribe({
          next: (data: ActiveZoneMinutes[]) => {
            this.processReportData(data.map(entry => ({
              dateTime: entry.dateTime,
              value: entry.value.activeZoneMinutes.toString() // Adjusted to fit the IActivity structure
            })));
          },
          error: (error) => {
            console.error('Error fetching active zone minutes time series data:', error);
          }
        });
      } else {
        this.fitbitService.fetchActivityTimeSeries(activityType, startDate, endDate).subscribe({
          next: (data: ActivityTimeSeries[]) => {
            this.processReportData(data);
          },
          error: (error) => {
            console.error('Error fetching time series data:', error);
          }
        });
      }
    } else {
      console.error('Invalid activity type:', this.metric.type);
    }
  }


  processReportData(data: ActivityTimeSeries[]) {
    if (this.view === 'week') {
      const weekData = this.fillWeekData(data);
      this.updateChart(weekData);
    } else if (this.view === 'month') {
      const monthData = this.fillMonthData(data);
      this.updateChart(monthData);
    } else if (this.view === 'year') {
      const monthlyData = this.aggregateByMonth(data); // Adjusted to handle yearly aggregation
      this.updateChart(monthlyData);
    }

    // Update goal line in the chart
    if (this.barChartOptions.plugins?.annotation?.annotations) {
      (this.barChartOptions.plugins.annotation.annotations as any).goalLine.value = this.metric.goal;
    }

    if (this.chart) {
      this.chart.update();
    }
  }

  calculatePercentage(value: number, goal: number): string {
    if (!goal) return '0';
    const percentage = (value / goal) * 100;
    return percentage > 100 ? '> 100' : percentage.toFixed(2);
  }

  updateChart(data: ActivityTimeSeries[]) {
    if (this.view === 'week') {
      const weekStartDate = this.getStartOfWeek(new Date(this.selectedDate || new Date()));
      const weekDates = Array.from({ length: 7 }, (_, i) => new Date(weekStartDate.getTime() + i * 24 * 60 * 60 * 1000));
      this.barChartLabels = weekDates.map(date => date.toLocaleDateString('default', { weekday: 'long' }));
      const weekData = weekDates.map(date => {
        const dayData = data.find(d => new Date(d.dateTime).toDateString() === date.toDateString());
        return dayData ? parseFloat(dayData.value) : 0;
      });
      this.barChartData = {
        labels: this.barChartLabels,
        datasets: [
          {
            data: weekData,
            backgroundColor: (context: any) => {
              const value = context.raw;
              const goalValue = this.metric.goal;
              return value >= goalValue ? getComputedStyle(document.documentElement).getPropertyValue('--achieved-color') : getComputedStyle(document.documentElement).getPropertyValue('--not-achieved-color');
            }
          }
        ]
      };
    } else if (this.view === 'month') {
      const currentMonth = new Date(this.selectedDate).getMonth();
      const daysInMonth = new Date(new Date(this.selectedDate).getFullYear(), currentMonth + 1, 0).getDate();
      this.barChartLabels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);
      const monthData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayData = data.find(d => new Date(d.dateTime).getDate() === day);
        return dayData ? parseFloat(dayData.value) : 0;
      });
      this.barChartData = {
        labels: this.barChartLabels,
        datasets: [
          {
            data: monthData,
            backgroundColor: (context: any) => {
              const value = context.raw;
              const goalValue = this.metric.goal;
              return value >= goalValue ? getComputedStyle(document.documentElement).getPropertyValue('--achieved-color') : getComputedStyle(document.documentElement).getPropertyValue('--not-achieved-color');
            }
          }
        ]
      };
    } else if (this.view === 'year') {
      const currentYear = new Date().getFullYear();
      const monthsInYear = 12;
      this.barChartLabels = Array.from({ length: monthsInYear }, (_, i) => new Date(currentYear, i).toLocaleString('default', { month: 'long' }));
      const yearData = Array.from({ length: monthsInYear }, (_, i) => {
        const monthData = data.find(d => d.dateTime.startsWith(`${currentYear}-${(i + 1).toString().padStart(2, '0')}`));
        return monthData ? parseFloat(monthData.value) : 0;
      });
      this.barChartData = {
        labels: this.barChartLabels,
        datasets: [
          {
            data: yearData,
            backgroundColor: (context: any) => {
              const value = context.raw;
              const goalValue = this.metric.goal;
              return value >= goalValue ? getComputedStyle(document.documentElement).getPropertyValue('--achieved-color') : getComputedStyle(document.documentElement).getPropertyValue('--not-achieved-color');
            }
          }
        ]
      };
    } else {
      this.barChartLabels = data.map((entry, index) => `Day ${index + 1}`);
      this.barChartData = {
        labels: this.barChartLabels,
        datasets: [
          {
            data: data.map(entry => parseFloat(entry.value)),
            backgroundColor: (context: any) => {
              const value = context.raw;
              const goalValue = this.metric.goal;
              return value >= goalValue ? getComputedStyle(document.documentElement).getPropertyValue('--achieved-color') : getComputedStyle(document.documentElement).getPropertyValue('--not-achieved-color');
            }
          }
        ]
      };
    }

    if (this.barChartOptions.plugins) {
      this.barChartOptions.plugins.legend = { display: this.metric.type === 'zoneMinutes' };
    }

    if (this.chart) {
      this.chart.update();
    }
  }

  fillWeekData(data: ActivityTimeSeries[]): ActivityTimeSeries[] {
    const startOfWeek = this.getStartOfWeek(new Date(this.selectedDate));
    const weekData = Array(7).fill(0).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayData = data.find(d => new Date(d.dateTime).toDateString() === date.toDateString());
      return {
        dateTime: date.toISOString().split('T')[0],
        value: dayData ? dayData.value : '0'  // Ensure value is a string
      };
    });
    return weekData;
  }

  fillMonthData(data: ActivityTimeSeries[]): ActivityTimeSeries[] {
    const currentMonth = new Date(this.selectedDate).getMonth();
    const daysInMonth = new Date(new Date(this.selectedDate).getFullYear(), currentMonth + 1, 0).getDate();
    const monthData = Array(daysInMonth).fill(0).map((_, i) => {
      const date = new Date(new Date(this.selectedDate).getFullYear(), currentMonth, i + 1);
      const dayData = data.find(d => new Date(d.dateTime).toDateString() === date.toDateString());
      return {
        dateTime: date.toISOString().split('T')[0],
        value: dayData ? dayData.value : '0'  // Ensure value is a string
      };
    });
    return monthData;
  }

  private getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  aggregateByMonth(data: ActivityTimeSeries[]): ActivityTimeSeries[] {
    const currentYear = new Date().getFullYear();
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      dateTime: `${currentYear}-${(i + 1).toString().padStart(2, '0')}-01`,
      value: '0'  // Initialize as string
    }));
    const monthCounts = Array.from({ length: 12 }, () => 0);

    data.forEach(entry => {
      const date = new Date(entry.dateTime);
      const dataMonth = date.getMonth();
      const dataYear = date.getFullYear();

      if (dataYear === currentYear) {
        monthlyData[dataMonth].value = (parseFloat(monthlyData[dataMonth].value) + parseFloat(entry.value)).toString();
        monthCounts[dataMonth]++;
      }
    });

    // Average the values per month
    for (let i = 0; i < 12; i++) {
      if (monthCounts[i] > 0) {
        monthlyData[i].value = (parseFloat(monthlyData[i].value) / monthCounts[i]).toFixed(2);
      }
    }

    return monthlyData;
  }


  mapMetricToActivityType(type: string): string {
    const validActivityTypes: { [key: string]: string } = {
      steps: 'steps',
      distance: 'distance',
      floors: 'floors',
      elevation: 'elevation',
      zoneMinutes: 'active-zone-minutes',
      fairlyActiveMinutes: 'minutesFairlyActive',
      lightlyActiveMinutes: 'minutesLightlyActive',
      sedentaryMinutes: 'minutesSedentary',
      caloriesOut: 'calories'
    };

    return validActivityTypes[type] || '';
  }

  formatNumber(value: number, metricType: string): string {
    return this.formatService.formatNumber(value, metricType);
  }
}

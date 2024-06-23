import { Component, Input, OnChanges, SimpleChanges, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { IonCard, IonCardContent, IonSegment, IonSegmentButton, IonLabel, IonContent } from '@ionic/angular/standalone';
import { FitbitService } from '../../services/fitbit.service';
import { FormatService } from '../../services/format.service';
import { endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, min, lastDayOfMonth, getDate, startOfWeek, addDays } from 'date-fns';
import { ActivityDetail, ActiveZoneMinutes, ActivityTimeSeries } from '../../models/activity.model';
import { SegmentChangeEventDetail } from '@ionic/core';
import { DateNavigatorComponent } from '../date-navigator/date-navigator.component'; // Import the navigator component
import { LocaleService } from '../../services/locale.service'

type SegmentValue = 'day' | 'week' | 'month' | 'year';

@Component({
  selector: 'app-activity-report',
  templateUrl: './activity-report.component.html',
  styleUrls: ['./activity-report.component.scss'],
  standalone: true,
  imports: [IonContent, IonLabel, CommonModule, IonCard, IonCardContent, BaseChartDirective, IonSegment, IonSegmentButton, DateNavigatorComponent] // Include the navigator component
})
export class ActivityReportComponent implements OnChanges, OnInit {
  @Input() metric!: ActivityDetail;
  @Input() selectedDate!: Date;
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
          },
          selectedDateLine: {
            type: 'line',
            scaleID: 'x',
            value: 0,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              content: 'Selected',
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
  reportSelectedDate!: Date;
  initializing: boolean = true;

  constructor(private fitbitService: FitbitService, private formatService: FormatService, private localeService: LocaleService) { }

  ngOnInit() {
    if (this.metric && this.selectedDate) {
      this.reportSelectedDate = this.selectedDate;
      this.checkAndLoadReportData();
      this.initializing = false; // Set initializing to false after initial load
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.initializing && ((changes['metric'] && this.metric) || (changes['selectedDate'] && this.selectedDate) || changes['view'])) {
      this.view = 'day';
      this.reportSelectedDate = this.selectedDate;
      this.checkAndLoadReportData();
    }
  }

  changeView(event: CustomEvent<SegmentChangeEventDetail>) {
    const value = event.detail.value as SegmentValue;
    this.view = value;
    this.reportSelectedDate = this.selectedDate;
    this.checkAndLoadReportData(); // Ensure data is re-fetched or re-processed
  }

  onDateChange(date: Date) {
    this.reportSelectedDate = date;
    this.checkAndLoadReportData(); // Ensure data is re-fetched or re-processed
  }

  checkAndLoadReportData() {
    if (this.metric && this.selectedDate && this.reportSelectedDate) {
      this.loadReportData(); // Ensure data is fetched for the selected view
    }
  }

  loadReportData() {
    let endDate: Date;
    let startDate: Date;

    switch (this.view) {
      case 'week':
        let weekStartDate = startOfWeek(this.reportSelectedDate, { weekStartsOn: 1 });
        weekStartDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());

        const weekEndDate = endOfWeek(this.reportSelectedDate, { weekStartsOn: 1 });
        weekEndDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());

        // If the start date of the week is in the previous month, set it to the start of the current month
        startDate = weekStartDate.getMonth() !== this.reportSelectedDate.getMonth()
          ? startOfMonth(this.reportSelectedDate)
          : weekStartDate;
        startDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());

        // If the end date of the week is in the next month, set it to the end of the current month
        endDate = weekEndDate.getMonth() !== this.reportSelectedDate.getMonth()
          ? endOfMonth(this.reportSelectedDate)
          : weekEndDate;

        // Make sure endDate is not in the future
        endDate = min([endDate, this.selectedDate]);
        endDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());
        break;

      case 'month':
        startDate = startOfMonth(this.reportSelectedDate);
        startDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());

        endDate = min([endOfMonth(this.reportSelectedDate), this.selectedDate]);
        endDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());
        break;

      case 'year':
        startDate = startOfYear(this.reportSelectedDate);
        startDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());

        endDate = min([endOfYear(this.reportSelectedDate), this.selectedDate]);
        endDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());
        break;

      case 'day':
      default:
        // For day view, no data is fetched
        return;
    }

    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    const activityType = this.mapMetricToActivityType(this.metric.type);
    if (activityType) {
      if (this.metric.type === 'zoneMinutes') {
        // Fetch data for active zone minutes
        this.fitbitService.fetchActiveZoneMinutesTimeSeries(startDateString, endDateString).subscribe({
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
        // Fetch data for other activity types
        this.fitbitService.fetchActivityTimeSeries(activityType, startDateString, endDateString).subscribe({
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
    let reportTitle = '';
    let selectedIndex: number | undefined;

    if (this.view === 'week') {
      ({ reportTitle, selectedIndex } = this.updateWeekView(data));
    } else if (this.view === 'month') {
      ({ reportTitle, selectedIndex } = this.updateMonthView(data));
    } else if (this.view === 'year') {
      ({ reportTitle, selectedIndex } = this.updateYearView(data));
    }

    this.updateChartOptions(selectedIndex, reportTitle);

    if (this.chart) {
      this.chart.update();
    }
  }

  updateWeekView(data: ActivityTimeSeries[]) {
    let weekStartDate = startOfWeek(new Date(this.reportSelectedDate || new Date()), { weekStartsOn: 1 });

    // Adjust weekStartDate to current time to avoid timezone issues
    weekStartDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());

    const weekDates = Array.from({ length: 7 }, (_, i) => new Date(weekStartDate.getTime() + i * 24 * 60 * 60 * 1000));
    this.barChartLabels = weekDates.map(date => date.toLocaleDateString(this.localeService.getLocale(), { weekday: 'short' }).slice(0, 3));
    const weekData = weekDates.map(date => {
      const isoDateString = date.toISOString().split('T')[0];
      const dayData = data.find(d => d.dateTime === isoDateString);
      return dayData ? parseFloat(dayData.value) : 0;
    });
    const selectedIndex = weekDates.findIndex(date => date.toISOString().split('T')[0] === this.selectedDate.toISOString().split('T')[0]);
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
    return { reportTitle: 'Weekly Report', selectedIndex };
  }

  updateMonthView(data: ActivityTimeSeries[]) {
    const currentMonth = this.reportSelectedDate.getMonth();
    const daysInMonth = new Date(this.reportSelectedDate.getFullYear(), currentMonth + 1, 0).getDate();
    this.barChartLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    const monthData = Array.from({ length: daysInMonth }, (_, day) => {
      const date = addDays(startOfMonth(this.reportSelectedDate).setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes()), day).toISOString().split('T')[0];
      const dayData = data.find(d => d.dateTime === date);
      return dayData ? parseFloat(dayData.value) : 0;
    });
    const selectedIndex = this.selectedDate.getDate() - 1;
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
    return { reportTitle: 'Monthly Report', selectedIndex };
  }

  updateYearView(data: ActivityTimeSeries[]) {
    const selectedYear = this.reportSelectedDate.getFullYear();
    const monthsInYear = 12;
    this.barChartLabels = Array.from({ length: monthsInYear }, (_, i) => new Date(selectedYear, i).toLocaleString(this.localeService.getLocale(), { month: 'short' }).slice(0, 3));
    const yearData = Array.from({ length: monthsInYear }, (_, i) => {
      const monthData = data.find(d => d.dateTime.startsWith(`${selectedYear}-${(i + 1).toString().padStart(2, '0')}`));
      return monthData ? parseFloat(monthData.value) : 0;
    });
    const selectedIndex = this.reportSelectedDate.getMonth();
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
    return { reportTitle: 'Yearly Report', selectedIndex };
  }

  updateChartOptions(selectedIndex: number | undefined, reportTitle: string) {
    let showSelectedDateLine = false;

    if (this.view === 'week') {
      const weekStartDate = startOfWeek(this.reportSelectedDate, { weekStartsOn: 1 });
      const weekEndDate = endOfWeek(this.reportSelectedDate, { weekStartsOn: 1 });
      showSelectedDateLine = this.selectedDate >= weekStartDate && this.selectedDate <= weekEndDate;
    } else if (this.view === 'month') {
      const startOfMonthDate = startOfMonth(this.reportSelectedDate);
      const endOfMonthDate = endOfMonth(this.reportSelectedDate);
      showSelectedDateLine = this.selectedDate >= startOfMonthDate && this.selectedDate <= endOfMonthDate;
    } else if (this.view === 'year') {
      const startOfYearDate = startOfYear(this.reportSelectedDate);
      const endOfYearDate = endOfYear(this.reportSelectedDate);
      showSelectedDateLine = this.selectedDate >= startOfYearDate && this.selectedDate <= endOfYearDate;
    }

    this.barChartOptions.plugins = {
      ...this.barChartOptions.plugins,
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const item = tooltipItems[0];
            const date = this.reportSelectedDate;
            if (this.view === 'week') {
              const weekStartDate = startOfWeek(date, { weekStartsOn: 1 });
              const tooltipDate = new Date(weekStartDate.getTime() + item.dataIndex * 24 * 60 * 60 * 1000);
              return tooltipDate.toLocaleDateString(this.localeService.getLocale(), { weekday: 'short', day: 'numeric', month: 'short' });
            } else if (this.view === 'month') {
              return new Date(date.getFullYear(), date.getMonth(), item.dataIndex + 1).toLocaleDateString(this.localeService.getLocale(), { weekday: 'short', day: 'numeric', month: 'short' });
            } else if (this.view === 'year') {
              return new Date(date.getFullYear(), item.dataIndex).toLocaleString(this.localeService.getLocale(), { month: 'long' });
            }
            return '';
          },
          label: (tooltipItem: any) => {
            return `Value: ${tooltipItem.raw}`;
          }
        }
      },
      annotation: {
        annotations: {
          ...this.barChartOptions.plugins?.annotation?.annotations,
          selectedDateLine: showSelectedDateLine && selectedIndex !== undefined ? {
            type: 'line',
            scaleID: 'x',
            value: selectedIndex,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              position: 'end',
              display: true
            }
          } : undefined
        }
      }
    };

    if (this.barChartOptions.plugins) {
      this.barChartOptions.plugins.legend = { display: false };
      if (this.barChartOptions.plugins.title) {
        this.barChartOptions.plugins.title.display = true;
        this.barChartOptions.plugins.title.text = reportTitle;
      } else {
        this.barChartOptions.plugins.title = {
          display: true,
          text: reportTitle
        };
      }
    }

    // Ensure the chart updates with the new annotation
    if (this.chart) {
      this.chart.update();
    }
  }


  fillWeekData(data: ActivityTimeSeries[]): ActivityTimeSeries[] {
    const weekStartDate = startOfWeek(this.reportSelectedDate, { weekStartsOn: 1 });
    const weekEndDate = endOfWeek(this.reportSelectedDate, { weekStartsOn: 1 });

    // Adjust weekStartDate and weekEndDate to report selected time to avoid timezone issues
    weekStartDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());
    weekEndDate.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes());

    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + i);
      const isoDateString = date.toISOString().split('T')[0];
      const dayData = data.find(d => d.dateTime === isoDateString);
      return {
        dateTime: isoDateString,
        value: dayData ? dayData.value : '0'  // Ensure value is a string
      };
    });

    return weekData;
  }

  fillMonthData(data: ActivityTimeSeries[]): ActivityTimeSeries[] {
    const currentMonth = this.reportSelectedDate.getMonth();
    const daysInMonth = new Date(this.reportSelectedDate.getFullYear(), currentMonth + 1, 0).getDate();
    const monthData = Array.from({ length: daysInMonth }, (_, i) => {
      const date = addDays(startOfMonth(this.reportSelectedDate), i);
      date.setHours(this.reportSelectedDate.getHours(), this.reportSelectedDate.getMinutes())
      const isoDateString = date.toISOString().split('T')[0];

      const dayData = data.find(d => d.dateTime === isoDateString);
      return {
        dateTime: isoDateString,
        value: dayData ? dayData.value : '0' // Ensure value is a string
      };
    });

    return monthData;
  }


  aggregateByMonth(data: ActivityTimeSeries[]): ActivityTimeSeries[] {
    if (data.length === 0) return [];

    const firstEntryDate = new Date(data[0].dateTime);
    const targetYear = firstEntryDate.getFullYear();

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      dateTime: `${targetYear}-${(i + 1).toString().padStart(2, '0')}-01`,
      value: '0'  // Initialize as string
    }));
    const monthCounts = Array.from({ length: 12 }, () => 0);

    data.forEach(entry => {
      const date = new Date(entry.dateTime);
      const dataMonth = date.getMonth();
      const dataYear = date.getFullYear();

      if (dataYear === targetYear) {
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

  formatMetricValue(metricValue: number, metricType: string, metricUnit: string): string {
    return this.formatService.formatMetricValue(metricValue, metricType, metricUnit);
  }
}

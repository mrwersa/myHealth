import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flameOutline, bicycleOutline, walkOutline, bedOutline, timerOutline, checkmarkCircle } from 'ionicons/icons';
import { ActivityDetail } from '../../models/activity.model';
import { FormatService } from '../../services/format.service';

@Component({
  selector: 'app-activity-progress',
  templateUrl: './activity-progress.component.html',
  styleUrls: ['./activity-progress.component.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule],
})
export class ActivityProgressComponent implements OnInit, OnChanges {
  @Input() metric!: ActivityDetail;
  @Input() selectedDate!: string;

  primaryProgress: number = 0;
  secondaryProgress: number = 0;

  private previousMetricType: string = '';
  private previousDate: string = '';

  constructor(private formatService: FormatService) {
    addIcons({
      'flame-outline': flameOutline,
      'bicycle-outline': bicycleOutline,
      'walk-outline': walkOutline,
      'bed-outline': bedOutline,
      'timer-outline': timerOutline,
      'checkmark-circle': checkmarkCircle
    });
  }

  ngOnInit() {
    this.checkAndUpdateProgress();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['metric'] && this.metric) || (changes['selectedDate'] && this.selectedDate)) {
      this.checkAndUpdateProgress();
    }
  }

  checkAndUpdateProgress() {
    if (this.metric && this.selectedDate) {
      if (this.metric.type !== this.previousMetricType || this.selectedDate !== this.previousDate) {
        this.updateProgress();
        this.previousMetricType = this.metric.type;
        this.previousDate = this.selectedDate;
      }
    }
  }

  updateProgress() {
    if (this.metric && this.metric.goal > 0) {
      const value = this.metric.value || 0;
      const percentage = (value / this.metric.goal) * 100;

      if (percentage <= 100) {
        this.primaryProgress = percentage;
        this.secondaryProgress = 0;
      } else {
        this.primaryProgress = 100;
        this.secondaryProgress = percentage - 100;
      }

      this.metric.goalAchieved = percentage >= 100;
    } else {
      this.primaryProgress = 0;
      this.secondaryProgress = 0;
      if (this.metric) {
        this.metric.goalAchieved = false;
      }
    }
  }

  formatMetricValue(metricValue: number, metricType: string, metricUnit: string): string {
    return this.formatService.formatMetricValue(metricValue, metricType, metricUnit);
  }
}

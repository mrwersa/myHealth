import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flameOutline, bicycleOutline, walkOutline, bedOutline, timerOutline, checkmarkCircle } from 'ionicons/icons';
import { ActivityDetail } from '../../models/activity.model';

@Component({
  selector: 'app-metric-chart',
  templateUrl: './metric-chart.component.html',
  styleUrls: ['./metric-chart.component.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule]
})
export class MetricChartComponent implements OnInit, OnChanges {
  @Input() metric!: ActivityDetail;
  @Input() selectedDate!: string; // Added input for selectedDate

  primaryProgress: number = 0;
  secondaryProgress: number = 0;

  constructor() {
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
    this.calculateProgress();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['metric'] || changes['selectedDate']) { // Handle both metric and date changes
      this.calculateProgress();
    }
  }

  calculateProgress() {
    if (this.metric && this.metric.goal > 0) {
      const percentage = (this.metric.value / this.metric.goal) * 100;

      if (percentage <= 100) {
        this.primaryProgress = percentage;
        this.secondaryProgress = 0;
      } else {
        this.primaryProgress = 100;
        this.secondaryProgress = percentage - 100;
      }

      this.metric.goalAchieved = percentage >= 100; // Set goalAchieved based on percentage
    } else {
      this.primaryProgress = 0;
      this.secondaryProgress = 0;
      if (this.metric) {
        this.metric.goalAchieved = false;
      }
    }
  }
}

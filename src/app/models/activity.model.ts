export interface Distance {
  activity: string;
  distance: number;
}

export interface HeartRateZone {
  name: string;
  min: number;
  max: number;
  minutes: number;
  caloriesOut: number;
}

export interface ActivitySummary {
  steps: number;
  caloriesOut: number;
  distances: Distance[];
  fairlyActiveMinutes: number;
  lightlyActiveMinutes: number;
  sedentaryMinutes: number;
  veryActiveMinutes: number;
  elevation: number;
  floors: number;
  heartRateZones: HeartRateZone[];
  restingHeartRate: number;
  activityCalories: number;
  caloriesBMR: number;
  marginalCalories: number;
  useEstimation: boolean;
  sleepMinutes: number;
}

export interface ActivityGoals {
  steps: number;
  caloriesOut: number;
  distance: number;
  activeMinutes: number;
  floors: number;
  sleep: number;
}

export interface Activity {
  summary: ActivitySummary;
  goals: ActivityGoals;
}

export interface ActivityTimeSeries {
  dateTime: string;
  value: string;
}

export interface ActiveZoneMinutes {
  dateTime: string;
  value: {
    activeZoneMinutes: number;
    fatBurnActiveZoneMinutes: number;
  };
}

export interface ActivityDetail {
  title: string;
  value: number;
  goal: number;
  unit: string;
  icon: string;
  goalAchieved: boolean;
  details: string;
  type: string;
}
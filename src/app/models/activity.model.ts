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
  activeMinutes: number;
  fairlyActiveMinutes: number;
  lightlyActiveMinutes: number;
  sedentaryMinutes: number;
  veryActiveMinutes: number;
  elevation: number; // Added as required
  floors: number; // Added as required
  heartRateZones: HeartRateZone[];
  restingHeartRate: number; // Changed to required
  activityCalories: number; // Added as required
  caloriesBMR: number; // Added as required
  marginalCalories: number; // Added as required
  useEstimation: boolean; // Changed to required
  sleepMinutes: number; // Changed to required
}

export interface ActivityGoals {
  steps: number;
  caloriesOut: number;
  distance: number;
  activeMinutes: number;
  floors: number; // Changed to required
  sleep: number; // Changed to required
  restingHeartRate?: number; // Assuming there is a goal for resting heart rate
}

export interface ActivityData {
  summary: ActivitySummary;
  goals: ActivityGoals;
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

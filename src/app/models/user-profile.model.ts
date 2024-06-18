export interface UserProfile {
    age: number;
    ambassador: boolean;
    autoStrideEnabled: boolean;
    avatar: string;
    avatar150: string;
    avatar640: string;
    averageDailySteps: number;
    challengesBeta: boolean;
    clockTimeDisplayFormat: '12hour' | '24hour';
    corporate: boolean;
    corporateAdmin: boolean;
    dateOfBirth: string;
    displayName: string;
    displayNameSetting: 'name' | 'username';
    distanceUnit: string;
    encodedId: string;
    features: {
      exerciseGoal: boolean;
    };
    firstName: string;
    foodsLocale: string;
    fullName: string;
    gender: 'MALE' | 'FEMALE' | 'NA';
    glucoseUnit: string;
    height: number;
    heightUnit: string;
    isBugReportEnabled: boolean;
    isChild: boolean;
    isCoach: boolean;
    languageLocale: string;
    lastName: string;
    legalTermsAcceptRequired: boolean;
    locale: string;
    memberSince: string;
    mfaEnabled: boolean;
    offsetFromUTCMillis: number;
    phoneNumber?: string;
    sdkDeveloper: boolean;
    sleepTracking: 'Normal' | 'Sensitive';
    startDayOfWeek: 'SUNDAY' | 'MONDAY';
    state: string;
    strideLengthRunning: number;
    strideLengthRunningType: 'default' | 'manual';
    strideLengthWalking: number;
    strideLengthWalkingType: 'default' | 'manual';
    swimUnit: string;
    temperatureUnit: string;
    timezone: string;
    topBadges: Array<{
      badgeType: string;
      dateTime: string;
      image125px: string;
      image300px: string;
      image75px: string;
      name: string;
      shortName: string;
      timesAchieved: number;
      value: number;
    }>;
    waterUnit: string;
    waterUnitName: string;
    weight: number;
    weightUnit: string;
  }
  
  export interface UserProfileResponse {
    user: UserProfile;
  }
  
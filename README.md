# MyHealth App

## Overview

MyHealth is a comprehensive health tracking application designed to help users monitor various health metrics, such as steps taken, distance traveled, active minutes, and more. The app integrates with Fitbit services to fetch and display health data in an intuitive and visually appealing manner. Users can view detailed reports, track their progress against goals, and manage their profile and settings.

## Features

- **Health Metrics Tracking**: Monitor steps, distance, active minutes, and other health metrics.
- **Visual Reports**: View detailed reports and charts for various health metrics.
- **Date Slider**: Easily navigate between different dates to view historical data.
- **User Profile**: Manage user profile information and settings.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Technologies Used

- **Angular**: Frontend framework for building the app.
- **Ionic**: Framework for building cross-platform mobile apps.
- **Chart.js**: Library for creating charts and graphs.
- **Fitbit API**: Service for fetching health data from Fitbit devices.

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/myhealth-app.git
   cd myhealth-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Application**
   ```bash
   ng serve
   ```

   The application will be available at `http://localhost:4200`.

## Usage

1. **Login**: Use your Fitbit account to login to the app.
2. **Dashboard**: View a summary of your health metrics.
3. **Reports**: Navigate to detailed reports for each metric.
4. **Profile**: Manage your user profile and app settings.

## Global Variables

The following global variables are used throughout the application for consistent styling:

```css
:root {
  --login-wrapper-background-color: #2a2a2a;
  --login-wrapper-padding: 20px;
  --login-wrapper-border-radius: 12px;
  --login-wrapper-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
  --login-logo-width: 100%;
  --login-text-align: center;
  --login-text-display: block;
  --login-wrapper-width: 90%;
  --login-wrapper-max-width: 320px;

  --menu-bg-color: #1e1e1e;
  --menu-text-color: #f0f0f0;
  --menu-icon-color: #ffffff;
  --menu-hover-bg-color: #2e2e2e;
  --divider-color: #555555;
  --menu-padding: 15px;
  --menu-item-margin: 10px 0;
  --menu-icon-size: 24px;
  --menu-font-size: 18px;
  --menu-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  --activity-metric-width: 200px;
  --activity-stroke-width: 4px;
  --activity-progress-bg-color: #3a3a3a;
  --activity-progress-meter-color: #76c7c0;
  --activity-progress-overlap-color: #004080;
  --activity-icon-size: 80px;
  --activity-tick-mark-size: 24px;
  --activity-tick-mark-color: #76c7c0;
  --activity-metric-info-gap: 15px;
  --activity-metric-title-font-size: 20px;
  --activity-metric-title-color: #f0f0f0;
  --activity-metric-value-font-size: 24px;
  --activity-metric-unit-font-size: 16px;
  --activity-metric-unit-color: #c0c0c0;

  --date-slider-bg-color: #2e2e2e;
  --date-slider-border-color: #4a4a4a;
  --date-slider-font-color: #ffffff;
  --date-slider-button-color: #1a73e8;
  --date-slider-font-size: 16px;

  --achieved-color: rgb(60, 179, 113);
  --not-achieved-color: rgb(211, 211, 211);
  --goal-line-color: rgb(16, 104, 235);
}
```

## Contributing

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature-branch
   ```
3. **Commit Changes**
   ```bash
   git commit -m "Add some feature"
   ```
4. **Push to Branch**
   ```bash
   git push origin feature-branch
   ```
5. **Create a Pull Request**

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Fitbit API for providing health data.
- Chart.js for the charting library.
- Ionic and Angular for the application framework.

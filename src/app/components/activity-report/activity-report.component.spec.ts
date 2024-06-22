import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivityReportComponent } from './activity-report.component';

describe('MetricInfoComponent', () => {
  let component: ActivityReportComponent;
  let fixture: ComponentFixture<ActivityReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ActivityReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

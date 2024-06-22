import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivityProgressComponent } from './activity-progress.component';

describe('ActivityProgressComponent', () => {
  let component: ActivityProgressComponent;
  let fixture: ComponentFixture<ActivityProgressComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ActivityProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

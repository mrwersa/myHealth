import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MetricInfoComponent } from './metric-info.component';

describe('MetricInfoComponent', () => {
  let component: MetricInfoComponent;
  let fixture: ComponentFixture<MetricInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MetricInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

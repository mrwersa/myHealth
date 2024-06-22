import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DateNavigatorComponent } from './date-navigator.component';

describe('DateNavigatorComponent', () => {
  let component: DateNavigatorComponent;
  let fixture: ComponentFixture<DateNavigatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DateNavigatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

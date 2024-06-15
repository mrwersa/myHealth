import { TestBed } from '@angular/core/testing';

import { FitbitService } from './fitbit.service';

describe('FitbitService', () => {
  let service: FitbitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FitbitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

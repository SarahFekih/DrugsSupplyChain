import { TestBed } from '@angular/core/testing';

import { WheelService } from './wheel.service';

describe('WheelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WheelService = TestBed.get(WheelService);
    expect(service).toBeTruthy();
  });
});

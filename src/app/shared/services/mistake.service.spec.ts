import { TestBed } from '@angular/core/testing';

import { MistakeService } from './mistake.service';

describe('MistakeService', () => {
  let service: MistakeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MistakeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

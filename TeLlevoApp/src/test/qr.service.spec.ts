import { TestBed } from '@angular/core/testing';

import { QRService } from '../app/services/qr.service';

describe('QRService', () => {
  let service: QRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

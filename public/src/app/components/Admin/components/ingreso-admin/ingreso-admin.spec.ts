import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoAdmin } from './ingreso-admin';

describe('IngresoAdmin', () => {
  let component: IngresoAdmin;
  let fixture: ComponentFixture<IngresoAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresoAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresoAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

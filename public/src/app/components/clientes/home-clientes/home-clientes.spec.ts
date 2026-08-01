import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeClientes } from './home-clientes';

describe('HomeClientes', () => {
  let component: HomeClientes;
  let fixture: ComponentFixture<HomeClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeClientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeClientes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

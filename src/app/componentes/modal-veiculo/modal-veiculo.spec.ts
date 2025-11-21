import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVeiculo } from './modal-veiculo';

describe('ModalVeiculo', () => {
  let component: ModalVeiculo;
  let fixture: ComponentFixture<ModalVeiculo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalVeiculo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalVeiculo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAgendamento } from './modal-agendamento';

describe('ModalAgendamento', () => {
  let component: ModalAgendamento;
  let fixture: ComponentFixture<ModalAgendamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAgendamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAgendamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
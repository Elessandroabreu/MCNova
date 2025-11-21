import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalServico } from './modal-servico';

describe('ModalServico', () => {
  let component: ModalServico;
  let fixture: ComponentFixture<ModalServico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalServico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalServico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
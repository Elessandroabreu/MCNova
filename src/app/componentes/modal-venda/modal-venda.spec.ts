import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVenda } from './modal-venda';

describe('ModalVenda', () => {
  let component: ModalVenda;
  let fixture: ComponentFixture<ModalVenda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalVenda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalVenda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Productslist } from './productslist';

describe('Productslist', () => {
  let component: Productslist;
  let fixture: ComponentFixture<Productslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Productslist],
    }).compileComponents();

    fixture = TestBed.createComponent(Productslist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

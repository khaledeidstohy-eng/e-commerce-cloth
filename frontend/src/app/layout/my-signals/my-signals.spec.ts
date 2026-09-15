import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySignals } from './my-signals';

describe('MySignals', () => {
  let component: MySignals;
  let fixture: ComponentFixture<MySignals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySignals],
    }).compileComponents();

    fixture = TestBed.createComponent(MySignals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

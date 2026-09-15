import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Userslist } from './userslist';

describe('Userslist', () => {
  let component: Userslist;
  let fixture: ComponentFixture<Userslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Userslist],
    }).compileComponents();

    fixture = TestBed.createComponent(Userslist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

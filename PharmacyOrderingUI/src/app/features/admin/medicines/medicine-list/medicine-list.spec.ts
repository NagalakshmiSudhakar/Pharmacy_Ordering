import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { MedicineList } from './medicine-list';

describe('MedicineList', () => {
  let component: MedicineList;
  let fixture: ComponentFixture<MedicineList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineList],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

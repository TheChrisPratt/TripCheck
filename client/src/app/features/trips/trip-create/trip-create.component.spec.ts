import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { TripCreateComponent } from './trip-create.component';
import { TripService } from '../../../services/trip.service';

describe('TripCreateComponent', () => {
  let component: TripCreateComponent;
  let fixture: ComponentFixture<TripCreateComponent>;
  let tripServiceSpy: jasmine.SpyObj<TripService>;
  let router: Router;

  beforeEach(async () => {
    tripServiceSpy = jasmine.createSpyObj('TripService', ['createTrip']);

    await TestBed.configureTestingModule({
      imports: [TripCreateComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TripService, useValue: tripServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(TripCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create form with default date', () => {
    expect(component).toBeTruthy();
    expect(component.tripData.startingDate).toBeDefined();
  });

  it('should call createTrip on submit and navigate to trip detail', () => {
    const createdTrip = {
      id: 10,
      name: 'Adventures in Alaska',
      startingDate: '2026-07-01',
      endingDate: '2026-07-01',
      preTripTasks: [],
      departureDayTasks: [],
      returnDayTasks: [],
      stops: []
    };
    tripServiceSpy.createTrip.and.returnValue(of(createdTrip));

    component.tripData.name = 'Adventures in Alaska';
    component.tripData.startingDate = '2026-07-01';
    component.onSubmit();

    expect(tripServiceSpy.createTrip).toHaveBeenCalledWith({
      name: 'Adventures in Alaska',
      startingDate: '2026-07-01'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/trips', 10]);
  });
});

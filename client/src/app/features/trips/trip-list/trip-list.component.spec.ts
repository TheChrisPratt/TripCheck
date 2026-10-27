import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TripListComponent } from './trip-list.component';
import { TripService } from '../../../services/trip.service';
import { AuthService } from '../../../core/auth/auth.service';

describe('TripListComponent', () => {
  let component: TripListComponent;
  let fixture: ComponentFixture<TripListComponent>;
  let tripServiceSpy: jasmine.SpyObj<TripService>;

  beforeEach(async () => {
    tripServiceSpy = jasmine.createSpyObj('TripService', ['getTrips', 'deleteTrip', 'cloneTrip']);
    tripServiceSpy.getTrips.and.returnValue(
      of([
        {
          id: 1,
          name: 'Grand Canyon Tour',
          startingDate: '2026-09-01',
          endingDate: '2026-09-06',
          stopCount: 2,
          totalTaskCount: 8,
          completedTaskCount: 4
        }
      ])
    );

    await TestBed.configureTestingModule({
      imports: [TripListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TripService, useValue: tripServiceSpy },
        {
          provide: AuthService,
          useValue: {
            checkAuthStatus: () => of({ authenticated: true, username: 'testuser' }),
            isAuthenticated: () => true,
            currentUser: () => ({ authenticated: true, username: 'testuser' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TripListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load trips', () => {
    expect(component).toBeTruthy();
    expect(tripServiceSpy.getTrips).toHaveBeenCalled();
    expect(component.trips().length).toBe(1);
    expect(component.trips()[0].name).toBe('Grand Canyon Tour');
  });

  it('should compute progress percentage correctly', () => {
    const trip = component.trips()[0];
    expect(component.getProgressPercentage(trip)).toBe(50);
  });

  it('should open clone modal and clone trip when submitted', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    const trip = component.trips()[0];
    component.onOpenCloneModal(trip);
    expect(component.tripToClone).toEqual(trip);

    const mockClonedResponse = {
      id: 2,
      name: 'Grand Canyon Tour 2027',
      startingDate: '2027-09-01',
      endingDate: '2027-09-06',
      stops: [],
      preTripTasks: [],
      departureDayTasks: [],
      returnDayTasks: []
    };
    tripServiceSpy.cloneTrip.and.returnValue(of(mockClonedResponse));

    component.onTripCloned({
      name: 'Grand Canyon Tour 2027',
      startingDate: '2027-09-01'
    });

    expect(tripServiceSpy.cloneTrip).toHaveBeenCalledWith(1, {
      name: 'Grand Canyon Tour 2027',
      startingDate: '2027-09-01'
    });
    expect(component.tripToClone).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/trips', 2]);
  });
});

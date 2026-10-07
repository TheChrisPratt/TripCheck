import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TripDetailComponent } from './trip-detail.component';
import { TripService } from '../../../services/trip.service';
import { TaskCategory, TaskStatus } from '../../../models/task.model';

describe('TripDetailComponent', () => {
  let component: TripDetailComponent;
  let fixture: ComponentFixture<TripDetailComponent>;
  let tripServiceSpy: jasmine.SpyObj<TripService>;

  const mockTripDetail = {
    id: 1,
    name: 'Yellowstone Trip',
    startingDate: '2026-08-01',
    endingDate: '2026-08-05',
    preTripTasks: [
      { id: 101, description: 'Service car', status: TaskStatus.COMPLETED, category: TaskCategory.PRE_TRIP }
    ],
    departureDayTasks: [
      { id: 102, description: 'Pack cooler', status: TaskStatus.INCOMPLETE, category: TaskCategory.DEPARTURE_DAY }
    ],
    returnDayTasks: [],
    stops: [
      {
        id: 201,
        name: 'Old Faithful',
        stopDate: '2026-08-01',
        numberOfNights: 4,
        orderIndex: 0,
        arrivalTasks: [],
        departureTasks: []
      }
    ]
  };

  beforeEach(async () => {
    tripServiceSpy = jasmine.createSpyObj('TripService', [
      'getTrip',
      'updateTrip',
      'updateTaskStatus',
      'deleteTask',
      'addPreTripTask',
      'addDepartureDayTask',
      'addReturnDayTask',
      'addStop',
      'deleteStop',
      'addArrivalTask',
      'addDepartureTask'
    ]);
    tripServiceSpy.getTrip.and.returnValue(of(mockTripDetail));

    await TestBed.configureTestingModule({
      imports: [TripDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['id', '1']]))
          }
        },
        { provide: TripService, useValue: tripServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TripDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load trip details', () => {
    expect(component).toBeTruthy();
    expect(tripServiceSpy.getTrip).toHaveBeenCalledWith(1);
    expect(component.trip()?.name).toBe('Yellowstone Trip');
    expect(component.trip()?.stops.length).toBe(1);
  });

  it('should calculate completed tasks count correctly', () => {
    const preTasks = component.trip()!.preTripTasks;
    expect(component.getCompletedCount(preTasks)).toBe(1);

    const depTasks = component.trip()!.departureDayTasks;
    expect(component.getCompletedCount(depTasks)).toBe(0);
  });

  it('should toggle checklist collapse state for pre-trip, departure day, and return day', () => {
    // Initially all open
    expect(component.isPreTripCollapsed()).toBeFalse();
    expect(component.isDepartureDayCollapsed()).toBeFalse();
    expect(component.isReturnDayCollapsed()).toBeFalse();

    // Toggle pre-trip
    component.togglePreTrip();
    expect(component.isPreTripCollapsed()).toBeTrue();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.checklist-card')[0].classList).toContain('is-collapsed');

    // Toggle again to expand
    component.togglePreTrip();
    expect(component.isPreTripCollapsed()).toBeFalse();

    // Toggle departure day
    component.toggleDepartureDay();
    expect(component.isDepartureDayCollapsed()).toBeTrue();

    // Toggle return day
    component.toggleReturnDay();
    expect(component.isReturnDayCollapsed()).toBeTrue();
  });

  it('should update trip name and starting date when submitted from edit modal', () => {
    const updatedTrip = {
      ...mockTripDetail,
      name: 'Yellowstone & Grand Teton',
      startingDate: '2026-08-10'
    };
    tripServiceSpy.updateTrip.and.returnValue(of(updatedTrip));

    component.showEditTripModal = true;
    component.onEditTripSubmitted({
      name: 'Yellowstone & Grand Teton',
      startingDate: '2026-08-10'
    });

    expect(tripServiceSpy.updateTrip).toHaveBeenCalledWith(1, {
      name: 'Yellowstone & Grand Teton',
      startingDate: '2026-08-10'
    });
    expect(component.trip()?.name).toBe('Yellowstone & Grand Teton');
    expect(component.trip()?.startingDate).toBe('2026-08-10');
    expect(component.showEditTripModal).toBeFalse();
  });
});

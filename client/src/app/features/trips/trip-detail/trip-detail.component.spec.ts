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
    users: [
      { id: 1, username: 'alice', displayName: 'Alice' }
    ],
    preTripTasks: [
      { id: 101, description: 'Service car', status: TaskStatus.COMPLETED, category: TaskCategory.PRE_TRIP, orderIndex: 1 }
    ],
    departureDayTasks: [
      { id: 102, description: 'Pack cooler', status: TaskStatus.INCOMPLETE, category: TaskCategory.DEPARTURE_DAY, orderIndex: 1 }
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
      'getUsers',
      'addTripUser',
      'removeTripUser',
      'updateTrip',
      'updateTask',
      'updateTaskStatus',
      'reorderTasks',
      'deleteTask',
      'addPreTripTask',
      'addDepartureDayTask',
      'addReturnDayTask',
      'addStop',
      'updateStop',
      'cloneStop',
      'deleteStop',
      'addArrivalTask',
      'addDepartureTask'
    ]);
    tripServiceSpy.getTrip.and.returnValue(of(mockTripDetail));
    tripServiceSpy.getUsers.and.returnValue(of([{ id: 1, username: 'alice' }, { id: 2, username: 'bob' }]));
    tripServiceSpy.reorderTasks.and.returnValue(of(undefined as unknown as void));

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

  it('should default all checklist accordions to closed', () => {
    expect(component.isPreTripCollapsed()).toBeTrue();
    expect(component.isDepartureDayCollapsed()).toBeTrue();
    expect(component.isReturnDayCollapsed()).toBeTrue();
  });

  it('should toggle checklist collapse state for pre-trip, departure day, and return day', () => {
    // Initially all closed
    expect(component.isPreTripCollapsed()).toBeTrue();
    expect(component.isDepartureDayCollapsed()).toBeTrue();
    expect(component.isReturnDayCollapsed()).toBeTrue();

    // Toggle pre-trip to expand
    component.togglePreTrip();
    expect(component.isPreTripCollapsed()).toBeFalse();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.checklist-card')[0].classList).not.toContain('is-collapsed');

    // Toggle again to collapse
    component.togglePreTrip();
    expect(component.isPreTripCollapsed()).toBeTrue();

    // Toggle departure day
    component.toggleDepartureDay();
    expect(component.isDepartureDayCollapsed()).toBeFalse();

    // Toggle return day
    component.toggleReturnDay();
    expect(component.isReturnDayCollapsed()).toBeFalse();
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

  it('should reorder tasks via drag and drop and call tripService.reorderTasks', () => {
    // Setup trip with 2 preTrip tasks
    const tripWithTasks = {
      ...mockTripDetail,
      preTripTasks: [
        { id: 101, description: 'Task 1', status: TaskStatus.INCOMPLETE, category: TaskCategory.PRE_TRIP, orderIndex: 0 },
        { id: 102, description: 'Task 2', status: TaskStatus.INCOMPLETE, category: TaskCategory.PRE_TRIP, orderIndex: 1 }
      ]
    };
    component.trip.set(tripWithTasks);

    const dragStartEvent = new DragEvent('dragstart');
    component.onTaskDragStart(dragStartEvent, 'preTrip', 0);
    expect(component.draggedState).toEqual({ listType: 'preTrip', index: 0 });

    const dropEvent = new DragEvent('drop');
    component.onTaskDrop(dropEvent, 'preTrip', 1);

    expect(component.trip()?.preTripTasks[0].id).toBe(102);
    expect(component.trip()?.preTripTasks[1].id).toBe(101);
    expect(tripServiceSpy.reorderTasks).toHaveBeenCalledWith([102, 101]);
  });

  it('should open clone modal and clone stop when submitted', () => {
    const stopToClone = mockTripDetail.stops[0];
    component.onOpenCloneModal(stopToClone);
    expect(component.stopToClone).toEqual(stopToClone);

    const clonedStopResponse = {
      ...stopToClone,
      id: 202,
      name: 'Old Faithful (Cloned)',
      orderIndex: 1
    };
    tripServiceSpy.cloneStop.and.returnValue(of(clonedStopResponse));

    component.onCloneStopSubmit({
      name: 'Old Faithful (Cloned)',
      numberOfNights: 4
    });

    expect(tripServiceSpy.cloneStop).toHaveBeenCalledWith(201, {
      name: 'Old Faithful (Cloned)',
      numberOfNights: 4
    });
    expect(component.stopToClone).toBeNull();
    expect(tripServiceSpy.getTrip).toHaveBeenCalled();
  });

  it('should open edit modal and update stop when submitted', () => {
    const stopToEdit = mockTripDetail.stops[0];
    component.onOpenEditModal(stopToEdit);
    expect(component.stopToEdit).toEqual(stopToEdit);

    const updatedStopResponse = {
      ...stopToEdit,
      name: 'Old Faithful Lodge Updated',
      numberOfNights: 5
    };
    tripServiceSpy.updateStop.and.returnValue(of(updatedStopResponse));

    component.onEditStopSubmit({
      name: 'Old Faithful Lodge Updated',
      numberOfNights: 5
    });

    expect(tripServiceSpy.updateStop).toHaveBeenCalledWith(201, {
      name: 'Old Faithful Lodge Updated',
      numberOfNights: 5
    });
    expect(component.stopToEdit).toBeNull();
    expect(tripServiceSpy.getTrip).toHaveBeenCalled();
  });

  it('should open edit task modal and update task when submitted', () => {
    const taskToEdit = mockTripDetail.preTripTasks[0];
    component.onOpenEditTaskModal(taskToEdit);
    expect(component.taskToEdit).toEqual(taskToEdit);

    const updatedTaskResponse = {
      ...taskToEdit,
      description: 'Service car and check tire pressure'
    };
    tripServiceSpy.updateTask.and.returnValue(of(updatedTaskResponse));

    component.onEditTaskSubmit({
      description: 'Service car and check tire pressure'
    });

    expect(tripServiceSpy.updateTask).toHaveBeenCalledWith(101, {
      description: 'Service car and check tire pressure'
    });
    expect(component.taskToEdit).toBeNull();
    expect(tripServiceSpy.getTrip).toHaveBeenCalled();
  });

  it('should open access modal and handle adding and removing collaborators', () => {
    component.onOpenAccessModal();
    expect(component.showAccessModal).toBeTrue();

    const tripWithBob = {
      ...mockTripDetail,
      users: [
        { id: 1, username: 'alice', displayName: 'Alice' },
        { id: 2, username: 'bob', displayName: 'Bob' }
      ]
    };
    tripServiceSpy.addTripUser.and.returnValue(of(tripWithBob));

    component.onAddCollaborator('bob');
    expect(tripServiceSpy.addTripUser).toHaveBeenCalledWith(1, 'bob');
    expect(component.trip()?.users?.length).toBe(2);

    const tripWithoutBob = {
      ...mockTripDetail,
      users: [
        { id: 1, username: 'alice', displayName: 'Alice' }
      ]
    };
    tripServiceSpy.removeTripUser.and.returnValue(of(tripWithoutBob));

    component.onRemoveCollaborator('bob');
    expect(tripServiceSpy.removeTripUser).toHaveBeenCalledWith(1, 'bob');
    expect(component.trip()?.users?.length).toBe(1);
  });
});

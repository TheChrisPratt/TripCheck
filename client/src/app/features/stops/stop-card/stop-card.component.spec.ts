import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StopCardComponent } from './stop-card.component';
import { TripService } from '../../../services/trip.service';
import { TaskCategory, TaskStatus } from '../../../models/task.model';

describe('StopCardComponent', () => {
  let component: StopCardComponent;
  let fixture: ComponentFixture<StopCardComponent>;
  let tripServiceSpy: jasmine.SpyObj<TripService>;

  beforeEach(async () => {
    tripServiceSpy = jasmine.createSpyObj('TripService', ['reorderTasks']);
    tripServiceSpy.reorderTasks.and.returnValue(of(undefined as unknown as void));

    await TestBed.configureTestingModule({
      imports: [StopCardComponent],
      providers: [
        { provide: TripService, useValue: tripServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StopCardComponent);
    component = fixture.componentInstance;
    component.stop = {
      id: 1,
      name: 'Yosemite Valley',
      stopDate: '2026-07-05',
      numberOfNights: 2,
      orderIndex: 0,
      checkinTime: '15:00',
      checkoutTime: '11:00',
      hookups: ['Electric', 'Water'],
      amenities: ['Trails', 'Scenic View'],
      services: ['Laundry', 'Propane'],
      codes: 'Gate: #1234, WiFi: Yose2026',
      arrivalTasks: [
        { id: 10, description: 'Check into campsite', status: TaskStatus.INCOMPLETE, category: TaskCategory.ARRIVAL, orderIndex: 0 },
        { id: 11, description: 'Set up camp stove', status: TaskStatus.INCOMPLETE, category: TaskCategory.ARRIVAL, orderIndex: 1 }
      ],
      departureTasks: []
    };
    fixture.detectChanges();
  });

  it('should create and display stop name and night count', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.stop-name')?.textContent).toContain('Yosemite Valley');
    expect(compiled.textContent).toContain('2 nights');
  });

  it('should render extended stop fields: times, hookups, codes, amenities, and services', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Check-in:');
    expect(compiled.textContent).toContain('3:00 PM');
    expect(compiled.textContent).toContain('Check-out:');
    expect(compiled.textContent).toContain('11:00 AM');

    const hookupBadges = compiled.querySelectorAll('.hookup-badge');
    expect(hookupBadges.length).toBe(2);
    expect(hookupBadges[0].textContent).toContain('Electric');
    expect(hookupBadges[1].textContent).toContain('Water');

    const codesBadge = compiled.querySelector('.codes-badge');
    expect(codesBadge?.textContent).toContain('Gate: #1234, WiFi: Yose2026');

    const amenityChips = compiled.querySelectorAll('.amenity-chip');
    expect(amenityChips.length).toBe(2);
    expect(amenityChips[0].textContent).toContain('Trails');
    expect(amenityChips[1].textContent).toContain('Scenic View');

    const serviceChips = compiled.querySelectorAll('.service-chip');
    expect(serviceChips.length).toBe(2);
    expect(serviceChips[0].textContent).toContain('Laundry');
    expect(serviceChips[1].textContent).toContain('Propane');
  });

  it('should calculate completed arrival tasks count', () => {
    expect(component.completedArrivalTasksCount).toBe(0);
    component.stop.arrivalTasks[0].status = TaskStatus.COMPLETED;
    expect(component.completedArrivalTasksCount).toBe(1);
  });

  it('should default all accordions to closed', () => {
    expect(component.isArrivalCollapsed()).toBeTrue();
    expect(component.isDepartureCollapsed()).toBeTrue();
  });

  it('should toggle collapse state for arrival and departure tasks', () => {
    expect(component.isArrivalCollapsed()).toBeTrue();
    expect(component.isDepartureCollapsed()).toBeTrue();

    // Toggle Arrival
    component.toggleArrival();
    expect(component.isArrivalCollapsed()).toBeFalse();

    // Toggle Departure
    component.toggleDeparture();
    expect(component.isDepartureCollapsed()).toBeFalse();
  });

  it('should reorder arrival tasks via drag and drop and call tripService.reorderTasks', () => {
    const dragStartEvent = new DragEvent('dragstart');
    component.onTaskDragStart(dragStartEvent, 'arrival', 0);
    expect(component.draggedState).toEqual({ listType: 'arrival', index: 0 });

    const dropEvent = new DragEvent('drop');
    component.onTaskDrop(dropEvent, 'arrival', 1);

    expect(component.stop.arrivalTasks[0].id).toBe(11);
    expect(component.stop.arrivalTasks[1].id).toBe(10);
    expect(tripServiceSpy.reorderTasks).toHaveBeenCalledWith([11, 10]);
  });

  it('should emit cloneStop when clone button is clicked', () => {
    spyOn(component.cloneStop, 'emit');
    const cloneBtn = fixture.nativeElement.querySelector('.btn-clone-stop') as HTMLButtonElement;
    expect(cloneBtn).toBeTruthy();
    cloneBtn.click();

    expect(component.cloneStop.emit).toHaveBeenCalledWith(component.stop);
  });

  it('should emit editStop when edit button is clicked', () => {
    spyOn(component.editStop, 'emit');
    const editBtn = fixture.nativeElement.querySelector('.btn-edit-stop') as HTMLButtonElement;
    expect(editBtn).toBeTruthy();
    editBtn.click();

    expect(component.editStop.emit).toHaveBeenCalledWith(component.stop);
  });
});

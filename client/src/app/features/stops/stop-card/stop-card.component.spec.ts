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
    component.isCollapsed.set(false);
    fixture.detectChanges();
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

  it('should default all accordions to closed when stop is not during current date', () => {
    expect(component.isCollapsed()).toBeTrue();
    expect(component.isArrivalCollapsed()).toBeTrue();
    expect(component.isDepartureCollapsed()).toBeTrue();
  });

  it('should default stop accordion to open if current date is after start date and before end date', () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    const stopDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;

    const activeFixture = TestBed.createComponent(StopCardComponent);
    const activeComponent = activeFixture.componentInstance;
    activeComponent.stop = {
      id: 2,
      name: 'Active Stop',
      stopDate: stopDateStr,
      numberOfNights: 4,
      orderIndex: 1,
      arrivalTasks: [],
      departureTasks: []
    };
    activeFixture.detectChanges();

    expect(activeComponent.isCollapsed()).toBeFalse();
  });

  it('should default stop accordion to closed if current date is before start date', () => {
    const now = new Date();
    const futureDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5);
    const stopDateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;

    const futureFixture = TestBed.createComponent(StopCardComponent);
    const futureComponent = futureFixture.componentInstance;
    futureComponent.stop = {
      id: 3,
      name: 'Future Stop',
      stopDate: stopDateStr,
      numberOfNights: 2,
      orderIndex: 2,
      arrivalTasks: [],
      departureTasks: []
    };
    futureFixture.detectChanges();

    expect(futureComponent.isCollapsed()).toBeTrue();
  });

  it('should default stop accordion to closed if current date is after end date', () => {
    const now = new Date();
    const pastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10);
    const stopDateStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;

    const pastFixture = TestBed.createComponent(StopCardComponent);
    const pastComponent = pastFixture.componentInstance;
    pastComponent.stop = {
      id: 4,
      name: 'Past Stop',
      stopDate: stopDateStr,
      numberOfNights: 2,
      orderIndex: 0,
      arrivalTasks: [],
      departureTasks: []
    };
    pastFixture.detectChanges();

    expect(pastComponent.isCollapsed()).toBeTrue();
  });

  it('should default stop accordion to open if current date is exactly on start date or end date', () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // Exactly on start date (today is start date)
    const startFixture = TestBed.createComponent(StopCardComponent);
    const startComponent = startFixture.componentInstance;
    startComponent.stop = {
      id: 5,
      name: 'Start Today Stop',
      stopDate: todayStr,
      numberOfNights: 3,
      orderIndex: 0,
      arrivalTasks: [],
      departureTasks: []
    };
    startFixture.detectChanges();
    expect(startComponent.isCollapsed()).toBeFalse();

      // Exactly on end date (start date was 2 days ago, numberOfNights is 2 -> end date is today)
    const pastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    const pastStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;
    const endFixture = TestBed.createComponent(StopCardComponent);
    const endComponent = endFixture.componentInstance;
    endComponent.stop = {
      id: 6,
      name: 'End Today Stop',
      stopDate: pastStr,
      numberOfNights: 2,
      orderIndex: 0,
      arrivalTasks: [],
      departureTasks: []
    };
    endFixture.detectChanges();
    expect(endComponent.isCollapsed()).toBeFalse();
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

  it('should emit taskEdit when onTaskEdit is called', () => {
    spyOn(component.taskEdit, 'emit');
    const task = component.stop.arrivalTasks[0];
    component.onTaskEdit(task);
    expect(component.taskEdit.emit).toHaveBeenCalledWith(task);
  });

  it('should emit editStop when edit button is clicked', () => {
    spyOn(component.editStop, 'emit');
    const editBtn = fixture.nativeElement.querySelector('.btn-edit-stop') as HTMLButtonElement;
    expect(editBtn).toBeTruthy();
    editBtn.click();

    expect(component.editStop.emit).toHaveBeenCalledWith(component.stop);
  });

  it('should render drag handle and collapse button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dragHandle = compiled.querySelector('.stop-drag-handle');
    const toggleBtn = compiled.querySelector('.stop-toggle-btn');

    expect(dragHandle).toBeTruthy();
    expect(toggleBtn).toBeTruthy();
  });

  it('should toggle stop collapsed state and hide details when collapsed', () => {
    expect(component.isCollapsed()).toBeTrue();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.stop-details-grid')).toBeNull();

      // Toggle expand
    component.toggleCollapse();
    fixture.detectChanges();

    expect(component.isCollapsed()).toBeFalse();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.stop-details-grid')).toBeTruthy();
      // Header remains visible
    expect(compiled.querySelector('.stop-header')).toBeTruthy();
    expect(compiled.querySelector('.stop-name')?.textContent).toContain('Yosemite Valley');

      // Toggle collapse again
    component.toggleCollapse();
    fixture.detectChanges();
    expect(component.isCollapsed()).toBeTrue();
    expect(fixture.nativeElement.querySelector('.stop-details-grid')).toBeNull();
  });

  it('should emit stopDragStart and stopDrop events', () => {
    spyOn(component.stopDragStart, 'emit');
    spyOn(component.stopDrop, 'emit');

    const dragStartEvent = new DragEvent('dragstart');
    component.index = 2;
    component.onStopDragStart(dragStartEvent);
    expect(component.stopDragStart.emit).toHaveBeenCalledWith({ event: dragStartEvent, index: 2 });

    const dropEvent = new DragEvent('drop');
    component.onStopDrop(dropEvent);
    expect(component.stopDrop.emit).toHaveBeenCalledWith({ event: dropEvent, index: 2 });
  });
});

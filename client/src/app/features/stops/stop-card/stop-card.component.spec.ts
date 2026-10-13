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

  it('should calculate completed arrival tasks count', () => {
    expect(component.completedArrivalTasksCount).toBe(0);
    component.stop.arrivalTasks[0].status = TaskStatus.COMPLETED;
    expect(component.completedArrivalTasksCount).toBe(1);
  });

  it('should toggle collapse state for arrival and departure tasks', () => {
    expect(component.isArrivalCollapsed()).toBeFalse();
    expect(component.isDepartureCollapsed()).toBeFalse();

    component.toggleArrival();
    expect(component.isArrivalCollapsed()).toBeTrue();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.tasks-section')[0].classList).toContain('is-collapsed');

    component.toggleArrival();
    expect(component.isArrivalCollapsed()).toBeFalse();

    component.toggleDeparture();
    expect(component.isDepartureCollapsed()).toBeTrue();
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
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StopCardComponent } from './stop-card.component';
import { TaskCategory, TaskStatus } from '../../../models/task.model';

describe('StopCardComponent', () => {
  let component: StopCardComponent;
  let fixture: ComponentFixture<StopCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopCardComponent]
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
        { id: 10, description: 'Check into campsite', status: TaskStatus.INCOMPLETE, category: TaskCategory.ARRIVAL }
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
});

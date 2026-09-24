import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskItemComponent } from './task-item.component';
import { TaskCategory, TaskStatus } from '../../../models/task.model';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
    component.task = {
      id: 1,
      description: 'Pack warm jacket',
      status: TaskStatus.INCOMPLETE,
      category: TaskCategory.PRE_TRIP
    };
    fixture.detectChanges();
  });

  it('should create and display description', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.task-text')?.textContent).toContain('Pack warm jacket');
  });

  it('should emit statusChange on checkbox toggle', () => {
    spyOn(component.statusChange, 'emit');
    component.onToggle();
    expect(component.statusChange.emit).toHaveBeenCalledWith({
      task: component.task,
      newStatus: TaskStatus.COMPLETED
    });
  });

  it('should emit deleteTask on delete button click', () => {
    spyOn(component.deleteTask, 'emit');
    component.onDelete();
    expect(component.deleteTask.emit).toHaveBeenCalledWith(component.task);
  });
});

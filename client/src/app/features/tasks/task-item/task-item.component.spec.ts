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
      category: TaskCategory.PRE_TRIP,
      orderIndex: 1
    };
    fixture.detectChanges();
  });

  it('should create and display description and grab handle', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.task-text')?.textContent).toContain('Pack warm jacket');
    expect(compiled.querySelector('.drag-handle')).toBeTruthy();
  });

  it('should emit itemDragStart on drag start', () => {
    spyOn(component.itemDragStart, 'emit');
    const dragEvent = new DragEvent('dragstart');
    component.onDragStart(dragEvent);
    expect(component.itemDragStart.emit).toHaveBeenCalledWith({
      event: dragEvent,
      task: component.task,
      index: 0
    });
  });

  it('should emit itemDrop on drop', () => {
    spyOn(component.itemDrop, 'emit');
    const dragEvent = new DragEvent('drop');
    component.onDrop(dragEvent);
    expect(component.itemDrop.emit).toHaveBeenCalledWith({
      event: dragEvent,
      task: component.task,
      index: 0
    });
  });

  it('should emit statusChange on checkbox toggle', () => {
    spyOn(component.statusChange, 'emit');
    component.onToggle();
    expect(component.statusChange.emit).toHaveBeenCalledWith({
      task: component.task,
      newStatus: TaskStatus.COMPLETED
    });
  });

  it('should emit editTask on edit button click', () => {
    spyOn(component.editTask, 'emit');
    const fakeEvent = new Event('click');
    component.onEdit(fakeEvent);
    expect(component.editTask.emit).toHaveBeenCalledWith(component.task);
  });

  it('should emit deleteTask on delete button click', () => {
    spyOn(component.deleteTask, 'emit');
    component.onDelete();
    expect(component.deleteTask.emit).toHaveBeenCalledWith(component.task);
  });
});

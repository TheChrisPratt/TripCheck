import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TaskEditModalComponent } from './task-edit-modal.component';

describe('TaskEditModalComponent', () => {
  let component: TaskEditModalComponent;
  let fixture: ComponentFixture<TaskEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskEditModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskEditModalComponent);
    component = fixture.componentInstance;
    component.initialDescription = 'Initial Task Description';
    fixture.detectChanges();
  });

  it('should create, initialize description, and autofocus the first input field', () => {
    expect(component).toBeTruthy();
    expect(component.description).toBe('Initial Task Description');
    const firstInput = fixture.debugElement.query(By.css('input#editTaskDescription'));
    expect(firstInput).toBeTruthy();
    expect(firstInput.nativeElement.hasAttribute('autofocus')).toBeTrue();
  });

  it('should emit taskSubmitted when submitted with non-empty description', () => {
    spyOn(component.taskSubmitted, 'emit');
    component.description = '  Buy sunscreen and hats  ';
    component.onSubmit();
    expect(component.taskSubmitted.emit).toHaveBeenCalledWith({
      description: 'Buy sunscreen and hats'
    });
  });

  it('should not emit taskSubmitted if description is empty or whitespace', () => {
    spyOn(component.taskSubmitted, 'emit');
    component.description = '   ';
    component.onSubmit();
    expect(component.taskSubmitted.emit).not.toHaveBeenCalled();
  });

  it('should emit modalClosed on cancel', () => {
    spyOn(component.modalClosed, 'emit');
    component.onCancel();
    expect(component.modalClosed.emit).toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TaskModalComponent } from './task-modal.component';

describe('TaskModalComponent', () => {
  let component: TaskModalComponent;
  let fixture: ComponentFixture<TaskModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskModalComponent);
    component = fixture.componentInstance;
    component.title = 'Add Pre-Trip Task';
    fixture.detectChanges();
  });

  it('should create and autofocus the first input field', () => {
    expect(component).toBeTruthy();
    const firstInput = fixture.debugElement.query(By.css('input#taskDescription'));
    expect(firstInput).toBeTruthy();
    expect(firstInput.nativeElement.hasAttribute('autofocus')).toBeTrue();
  });

  it('should emit taskSubmitted when submitted with non-empty description', () => {
    spyOn(component.taskSubmitted, 'emit');
    component.description = '  Buy sunscreen  ';
    component.onSubmit();
    expect(component.taskSubmitted.emit).toHaveBeenCalledWith('Buy sunscreen');
    expect(component.description).toBe('');
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

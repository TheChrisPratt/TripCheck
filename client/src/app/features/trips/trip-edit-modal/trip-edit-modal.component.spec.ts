import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TripEditModalComponent } from './trip-edit-modal.component';

describe('TripEditModalComponent', () => {
  let component: TripEditModalComponent;
  let fixture: ComponentFixture<TripEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripEditModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TripEditModalComponent);
    component = fixture.componentInstance;
    component.initialName = 'California Dreamin';
    component.initialStartingDate = '2026-09-15';
    fixture.detectChanges();
  });

  it('should initialize with initial values and autofocus first input field', () => {
    expect(component).toBeTruthy();
    expect(component.tripData.name).toBe('California Dreamin');
    expect(component.tripData.startingDate).toBe('2026-09-15');
    const firstInput = fixture.debugElement.query(By.css('input#editTripName'));
    expect(firstInput).toBeTruthy();
    expect(firstInput.nativeElement.hasAttribute('autofocus')).toBeTrue();
  });

  it('should emit tripSubmitted with trimmed name when valid', () => {
    spyOn(component.tripSubmitted, 'emit');
    component.tripData = {
      name: '  Updated Pacific Trip  ',
      startingDate: '2026-10-01'
    };

    component.onSubmit();

    expect(component.tripSubmitted.emit).toHaveBeenCalledWith({
      name: 'Updated Pacific Trip',
      startingDate: '2026-10-01'
    });
  });

  it('should not emit tripSubmitted if name is blank', () => {
    spyOn(component.tripSubmitted, 'emit');
    component.tripData = {
      name: '   ',
      startingDate: '2026-10-01'
    };

    component.onSubmit();

    expect(component.tripSubmitted.emit).not.toHaveBeenCalled();
  });

  it('should emit modalClosed on cancel', () => {
    spyOn(component.modalClosed, 'emit');
    component.onCancel();
    expect(component.modalClosed.emit).toHaveBeenCalled();
  });
});

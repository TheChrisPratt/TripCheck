import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TripCloneModalComponent } from './trip-clone-modal.component';

describe('TripCloneModalComponent', () => {
  let component: TripCloneModalComponent;
  let fixture: ComponentFixture<TripCloneModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripCloneModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TripCloneModalComponent);
    component = fixture.componentInstance;
    component.initialName = 'California Dreamin';
    component.initialStartingDate = '2026-09-15';
    fixture.detectChanges();
  });

  it('should initialize with initial values and autofocus first input field', () => {
    expect(component).toBeTruthy();
    expect(component.tripData.name).toBe('California Dreamin');
    expect(component.tripData.startingDate).toBe('2026-09-15');
    const firstInput = fixture.debugElement.query(By.css('input#cloneTripName'));
    expect(firstInput).toBeTruthy();
    expect(firstInput.nativeElement.hasAttribute('autofocus')).toBeTrue();
  });

  it('should emit tripCloned with trimmed name when valid', () => {
    spyOn(component.tripCloned, 'emit');
    component.tripData = {
      name: '  Cloned Pacific Trip  ',
      startingDate: '2027-10-01'
    };

    component.onSubmit();

    expect(component.tripCloned.emit).toHaveBeenCalledWith({
      name: 'Cloned Pacific Trip',
      startingDate: '2027-10-01'
    });
  });

  it('should not emit tripCloned if name is blank', () => {
    spyOn(component.tripCloned, 'emit');
    component.tripData = {
      name: '   ',
      startingDate: '2027-10-01'
    };

    component.onSubmit();

    expect(component.tripCloned.emit).not.toHaveBeenCalled();
  });

  it('should not emit tripCloned if startingDate is blank', () => {
    spyOn(component.tripCloned, 'emit');
    component.tripData = {
      name: 'Cloned Trip',
      startingDate: ''
    };

    component.onSubmit();

    expect(component.tripCloned.emit).not.toHaveBeenCalled();
  });

  it('should emit modalClosed on cancel', () => {
    spyOn(component.modalClosed, 'emit');
    component.onCancel();
    expect(component.modalClosed.emit).toHaveBeenCalled();
  });
});

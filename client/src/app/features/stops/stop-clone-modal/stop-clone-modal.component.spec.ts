import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StopCloneModalComponent } from './stop-clone-modal.component';

describe('StopCloneModalComponent', () => {
  let component: StopCloneModalComponent;
  let fixture: ComponentFixture<StopCloneModalComponent>;

  const mockSourceStop = {
    id: 1,
    name: 'Old Faithful Geyser',
    stopDate: '2026-08-01',
    location: 'Yellowstone National Park',
    numberOfNights: 3,
    webAddress: 'https://nps.gov/yell',
    telephoneNumber: '555-9876',
    confirmationCode: 'CONF-111',
    siteNumber: 'Site A12',
    notes: 'Arrive early for parking',
    orderIndex: 0,
    arrivalTasks: [],
    departureTasks: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopCloneModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StopCloneModalComponent);
    component = fixture.componentInstance;
    component.sourceStop = mockSourceStop;
    fixture.detectChanges();
  });

  it('should create and autofocus the first input field', () => {
    expect(component).toBeTruthy();
    const firstInput = fixture.debugElement.query(By.css('input#cloneStopName'));
    expect(firstInput).toBeTruthy();
    expect(firstInput.nativeElement.hasAttribute('autofocus')).toBeTrue();
  });

  it('should pre-populate form fields from source stop', () => {
    expect(component.stopData.name).toBe('Old Faithful Geyser');
    expect(component.stopData.numberOfNights).toBe(3);
    expect(component.stopData.location).toBe('Yellowstone National Park');
    expect(component.stopData.webAddress).toBe('https://nps.gov/yell');
    expect(component.stopData.telephoneNumber).toBe('555-9876');
    expect(component.stopData.confirmationCode).toBe('CONF-111');
    expect(component.stopData.siteNumber).toBe('Site A12');
    expect(component.stopData.notes).toBe('Arrive early for parking');
    expect(component.stopData.stopDate).toBe('2026-08-01');
  });

  it('should emit stopCloned with new/modified values when form is valid', () => {
    spyOn(component.stopCloned, 'emit');
    component.stopData = {
      name: '  Old Faithful Geyser (Cloned)  ',
      location: 'New Location',
      numberOfNights: 2,
      webAddress: 'https://example.com',
      telephoneNumber: '555-0000',
      confirmationCode: 'CONF-222',
      siteNumber: 'Site B4',
      notes: 'New notes',
      stopDate: '2026-08-04'
    };

    component.onSubmit();

    expect(component.stopCloned.emit).toHaveBeenCalledWith({
      name: 'Old Faithful Geyser (Cloned)',
      location: 'New Location',
      numberOfNights: 2,
      webAddress: 'https://example.com',
      telephoneNumber: '555-0000',
      confirmationCode: 'CONF-222',
      siteNumber: 'Site B4',
      notes: 'New notes',
      stopDate: '2026-08-04'
    });
  });

  it('should not emit stopCloned if name is blank', () => {
    spyOn(component.stopCloned, 'emit');
    component.stopData.name = '   ';
    component.onSubmit();
    expect(component.stopCloned.emit).not.toHaveBeenCalled();
  });

  it('should emit modalClosed on cancel', () => {
    spyOn(component.modalClosed, 'emit');
    component.onCancel();
    expect(component.modalClosed.emit).toHaveBeenCalled();
  });
});

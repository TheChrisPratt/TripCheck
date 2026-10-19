import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StopEditModalComponent } from './stop-edit-modal.component';

describe('StopEditModalComponent', () => {
  let component: StopEditModalComponent;
  let fixture: ComponentFixture<StopEditModalComponent>;

  const mockStop = {
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
      imports: [StopEditModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StopEditModalComponent);
    component = fixture.componentInstance;
    component.stop = mockStop;
    fixture.detectChanges();
  });

  it('should create and autofocus the first input field', () => {
    expect(component).toBeTruthy();
    const firstInput = fixture.debugElement.query(By.css('input#editStopName'));
    expect(firstInput).toBeTruthy();
    expect(firstInput.nativeElement.hasAttribute('autofocus')).toBeTrue();
  });

  it('should pre-populate form fields from existing stop', () => {
    expect(component.stopData.name).toBe('Old Faithful Geyser');
    expect(component.stopData.numberOfNights).toBe(3);
    expect(component.stopData.location).toBe('Yellowstone National Park');
    expect(component.stopData.webAddress).toBe('https://nps.gov/yell');
    expect(component.stopData.telephoneNumber).toBe('555-9876');
    expect(component.stopData.confirmationCode).toBe('CONF-111');
    expect(component.stopData.siteNumber).toBe('Site A12');
    expect(component.stopData.notes).toBe('Arrive early for parking');
  });

  it('should emit stopUpdated with trimmed name and modified values when valid', () => {
    spyOn(component.stopUpdated, 'emit');
    component.stopData = {
      name: '  Updated Stop Name  ',
      location: 'New Location',
      numberOfNights: 4,
      webAddress: 'https://example.com/updated',
      telephoneNumber: '555-4321',
      confirmationCode: 'CONF-333',
      siteNumber: 'Site B10',
      notes: 'Updated notes'
    };

    component.onSubmit();

    expect(component.stopUpdated.emit).toHaveBeenCalledWith({
      name: 'Updated Stop Name',
      location: 'New Location',
      numberOfNights: 4,
      webAddress: 'https://example.com/updated',
      telephoneNumber: '555-4321',
      confirmationCode: 'CONF-333',
      siteNumber: 'Site B10',
      notes: 'Updated notes'
    });
  });

  it('should not emit stopUpdated if name is blank', () => {
    spyOn(component.stopUpdated, 'emit');
    component.stopData.name = '   ';
    component.onSubmit();
    expect(component.stopUpdated.emit).not.toHaveBeenCalled();
  });

  it('should emit modalClosed on cancel', () => {
    spyOn(component.modalClosed, 'emit');
    component.onCancel();
    expect(component.modalClosed.emit).toHaveBeenCalled();
  });
});

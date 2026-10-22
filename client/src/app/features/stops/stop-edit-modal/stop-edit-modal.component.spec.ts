import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { StopEditModalComponent } from './stop-edit-modal.component';
import { TripService } from '../../../services/trip.service';

describe('StopEditModalComponent', () => {
  let component: StopEditModalComponent;
  let fixture: ComponentFixture<StopEditModalComponent>;
  let tripServiceSpy: jasmine.SpyObj<TripService>;

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
    checkinTime: '15:00',
    checkoutTime: '11:00',
    hookups: ['Electric', 'Water'],
    amenities: ['Trails', 'Scenic View'],
    services: ['Laundry'],
    codes: 'Gate: #1234',
    arrivalTasks: [],
    departureTasks: []
  };

  beforeEach(async () => {
    tripServiceSpy = jasmine.createSpyObj('TripService', ['getAmenities', 'getServices']);
    tripServiceSpy.getAmenities.and.returnValue(of(['Scenic View', 'Trails', 'Water Access']));
    tripServiceSpy.getServices.and.returnValue(of(['Laundry', 'Propane']));

    await TestBed.configureTestingModule({
      imports: [StopEditModalComponent],
      providers: [
        { provide: TripService, useValue: tripServiceSpy }
      ]
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

  it('should pre-populate form fields from existing stop including extended fields', () => {
    expect(component.stopData.name).toBe('Old Faithful Geyser');
    expect(component.stopData.numberOfNights).toBe(3);
    expect(component.stopData.location).toBe('Yellowstone National Park');
    expect(component.stopData.webAddress).toBe('https://nps.gov/yell');
    expect(component.stopData.telephoneNumber).toBe('555-9876');
    expect(component.stopData.confirmationCode).toBe('CONF-111');
    expect(component.stopData.siteNumber).toBe('Site A12');
    expect(component.stopData.notes).toBe('Arrive early for parking');
    expect(component.stopData.checkinTime).toBe('15:00');
    expect(component.stopData.checkoutTime).toBe('11:00');
    expect(component.stopData.codes).toBe('Gate: #1234');
    expect(component.selectedHookups.has('Electric')).toBeTrue();
    expect(component.selectedHookups.has('Water')).toBeTrue();
    expect(component.amenitiesList).toEqual(['Trails', 'Scenic View']);
    expect(component.servicesList).toEqual(['Laundry']);
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
      notes: 'Updated notes',
      checkinTime: '16:00',
      checkoutTime: '10:00',
      codes: 'Lockbox: 9999'
    };
    component.toggleHookup('Sewer');
    component.amenitiesList = ['Trails', 'Water Access'];
    component.servicesList = ['Laundry', 'Propane'];

    component.onSubmit();

    expect(component.stopUpdated.emit).toHaveBeenCalledWith({
      name: 'Updated Stop Name',
      location: 'New Location',
      numberOfNights: 4,
      webAddress: 'https://example.com/updated',
      telephoneNumber: '555-4321',
      confirmationCode: 'CONF-333',
      siteNumber: 'Site B10',
      notes: 'Updated notes',
      checkinTime: '16:00',
      checkoutTime: '10:00',
      codes: 'Lockbox: 9999',
      hookups: ['Electric', 'Water', 'Sewer'],
      amenities: ['Trails', 'Water Access'],
      services: ['Laundry', 'Propane']
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

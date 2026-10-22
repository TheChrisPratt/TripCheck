import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { StopCloneModalComponent } from './stop-clone-modal.component';
import { TripService } from '../../../services/trip.service';

describe('StopCloneModalComponent', () => {
  let component: StopCloneModalComponent;
  let fixture: ComponentFixture<StopCloneModalComponent>;
  let tripServiceSpy: jasmine.SpyObj<TripService>;

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
    checkinTime: '15:00',
    checkoutTime: '11:00',
    hookups: ['Electric', 'Water'],
    amenities: ['Trails'],
    services: ['Propane'],
    codes: 'Gate: 5555',
    arrivalTasks: [],
    departureTasks: []
  };

  beforeEach(async () => {
    tripServiceSpy = jasmine.createSpyObj('TripService', ['getAmenities', 'getServices']);
    tripServiceSpy.getAmenities.and.returnValue(of(['Fire Pit', 'Trails']));
    tripServiceSpy.getServices.and.returnValue(of(['Ice', 'Propane']));

    await TestBed.configureTestingModule({
      imports: [StopCloneModalComponent],
      providers: [
        { provide: TripService, useValue: tripServiceSpy }
      ]
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

  it('should pre-populate form fields from source stop including extended fields', () => {
    expect(component.stopData.name).toBe('Old Faithful Geyser');
    expect(component.stopData.numberOfNights).toBe(3);
    expect(component.stopData.location).toBe('Yellowstone National Park');
    expect(component.stopData.webAddress).toBe('https://nps.gov/yell');
    expect(component.stopData.telephoneNumber).toBe('555-9876');
    expect(component.stopData.confirmationCode).toBe('CONF-111');
    expect(component.stopData.siteNumber).toBe('Site A12');
    expect(component.stopData.notes).toBe('Arrive early for parking');
    expect(component.stopData.stopDate).toBe('2026-08-01');
    expect(component.stopData.checkinTime).toBe('15:00');
    expect(component.stopData.checkoutTime).toBe('11:00');
    expect(component.stopData.codes).toBe('Gate: 5555');
    expect(component.selectedHookups.has('Electric')).toBeTrue();
    expect(component.selectedHookups.has('Water')).toBeTrue();
    expect(component.amenitiesList).toEqual(['Trails']);
    expect(component.servicesList).toEqual(['Propane']);
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
      stopDate: '2026-08-04',
      checkinTime: '14:00',
      checkoutTime: '10:00',
      codes: 'Gate: 7777'
    };
    component.toggleHookup('Sewer');
    component.amenitiesList = ['Trails', 'Fire Pit'];
    component.servicesList = ['Propane', 'Ice'];

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
      stopDate: '2026-08-04',
      checkinTime: '14:00',
      checkoutTime: '10:00',
      codes: 'Gate: 7777',
      hookups: ['Electric', 'Water', 'Sewer'],
      amenities: ['Trails', 'Fire Pit'],
      services: ['Propane', 'Ice']
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

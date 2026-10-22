import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { StopModalComponent } from './stop-modal.component';
import { TripService } from '../../../services/trip.service';

describe('StopModalComponent', () => {
  let component: StopModalComponent;
  let fixture: ComponentFixture<StopModalComponent>;
  let tripServiceSpy: jasmine.SpyObj<TripService>;

  beforeEach(async () => {
    tripServiceSpy = jasmine.createSpyObj('TripService', ['getAmenities', 'getServices']);
    tripServiceSpy.getAmenities.and.returnValue(of(['Scenic View', 'Trails']));
    tripServiceSpy.getServices.and.returnValue(of(['Laundry', 'Propane']));

    await TestBed.configureTestingModule({
      imports: [StopModalComponent],
      providers: [
        { provide: TripService, useValue: tripServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StopModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and autofocus the first input field', () => {
    expect(component).toBeTruthy();
    const firstInput = fixture.debugElement.query(By.css('input#stopName'));
    expect(firstInput).toBeTruthy();
    expect(firstInput.nativeElement.hasAttribute('autofocus')).toBeTrue();
  });

  it('should load suggestions from TripService on init', () => {
    expect(tripServiceSpy.getAmenities).toHaveBeenCalled();
    expect(tripServiceSpy.getServices).toHaveBeenCalled();
    expect(component.amenitySuggestions).toEqual(['Scenic View', 'Trails']);
    expect(component.serviceSuggestions).toEqual(['Laundry', 'Propane']);
  });

  it('should emit stopSubmitted when form is valid including extended fields', () => {
    spyOn(component.stopSubmitted, 'emit');
    component.stopData = {
      name: '  Yosemite Valley  ',
      location: 'California',
      numberOfNights: 2,
      webAddress: 'https://nps.gov/yose',
      telephoneNumber: '555-1234',
      confirmationCode: 'RES-123',
      siteNumber: '42',
      notes: 'Bring bear spray',
      checkinTime: '15:00',
      checkoutTime: '11:00',
      codes: 'Gate: #4321'
    };
    component.toggleHookup('Electric');
    component.toggleHookup('Water');
    component.amenitiesList = ['Trails', 'Scenic View'];
    component.servicesList = ['Laundry'];

    component.onSubmit();

    expect(component.stopSubmitted.emit).toHaveBeenCalledWith({
      name: 'Yosemite Valley',
      location: 'California',
      numberOfNights: 2,
      webAddress: 'https://nps.gov/yose',
      telephoneNumber: '555-1234',
      confirmationCode: 'RES-123',
      siteNumber: '42',
      notes: 'Bring bear spray',
      checkinTime: '15:00',
      checkoutTime: '11:00',
      codes: 'Gate: #4321',
      hookups: ['Electric', 'Water'],
      amenities: ['Trails', 'Scenic View'],
      services: ['Laundry']
    });
  });

  it('should not emit stopSubmitted if name is blank', () => {
    spyOn(component.stopSubmitted, 'emit');
    component.stopData.name = '   ';
    component.onSubmit();
    expect(component.stopSubmitted.emit).not.toHaveBeenCalled();
  });

  it('should emit modalClosed on cancel', () => {
    spyOn(component.modalClosed, 'emit');
    component.onCancel();
    expect(component.modalClosed.emit).toHaveBeenCalled();
  });
});

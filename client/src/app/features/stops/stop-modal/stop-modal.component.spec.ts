import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StopModalComponent } from './stop-modal.component';

describe('StopModalComponent', () => {
  let component: StopModalComponent;
  let fixture: ComponentFixture<StopModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopModalComponent]
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

  it('should emit stopSubmitted when form is valid', () => {
    spyOn(component.stopSubmitted, 'emit');
    component.stopData = {
      name: '  Yosemite Valley  ',
      location: 'California',
      numberOfNights: 2,
      webAddress: 'https://nps.gov/yose',
      telephoneNumber: '555-1234',
      confirmationCode: 'RES-123',
      siteNumber: '42',
      notes: 'Bring bear spray'
    };

    component.onSubmit();

    expect(component.stopSubmitted.emit).toHaveBeenCalledWith({
      name: 'Yosemite Valley',
      location: 'California',
      numberOfNights: 2,
      webAddress: 'https://nps.gov/yose',
      telephoneNumber: '555-1234',
      confirmationCode: 'RES-123',
      siteNumber: '42',
      notes: 'Bring bear spray'
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

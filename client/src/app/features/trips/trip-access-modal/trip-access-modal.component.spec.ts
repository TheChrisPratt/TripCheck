import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { TripAccessModalComponent } from './trip-access-modal.component';
import { TripService } from '../../../services/trip.service';
import { UserSummary } from '../../../models/user.model';

describe('TripAccessModalComponent', () => {
  let component: TripAccessModalComponent;
  let fixture: ComponentFixture<TripAccessModalComponent>;
  let mockTripService: jasmine.SpyObj<TripService>;

  const mockUsers: UserSummary[] = [
    { id: 1, username: 'alice', displayName: 'Alice Wonderland' },
    { id: 2, username: 'bob', displayName: 'Bob Builder' },
    { id: 3, username: 'charlie', displayName: 'Charlie Brown' }
  ];

  beforeEach(async () => {
    mockTripService = jasmine.createSpyObj('TripService', ['getUsers']);
    mockTripService.getUsers.and.returnValue(of(mockUsers));

    await TestBed.configureTestingModule({
      imports: [TripAccessModalComponent],
      providers: [
        { provide: TripService, useValue: mockTripService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TripAccessModalComponent);
    component = fixture.componentInstance;
    component.collaborators = [
      { id: 1, username: 'alice', displayName: 'Alice Wonderland' }
    ];
    fixture.detectChanges();
  });

  it('should create and autofocus first input field', () => {
    expect(component).toBeTruthy();
    const input = fixture.debugElement.query(By.css('input#collabUsername'));
    expect(input).toBeTruthy();
    expect(input.nativeElement.hasAttribute('autofocus')).toBeTrue();
  });

  it('should load registered users and filter suggestions excluding existing collaborators', () => {
    expect(mockTripService.getUsers).toHaveBeenCalled();
    expect(component.allUsers.length).toBe(3);

    const suggestions = component.availableSuggestions;
    expect(suggestions.length).toBe(2);
    expect(suggestions.find(u => u.username === 'alice')).toBeUndefined();
    expect(suggestions.find(u => u.username === 'bob')).toBeDefined();
    expect(suggestions.find(u => u.username === 'charlie')).toBeDefined();
  });

  it('should emit userAdded with trimmed username and clear field', () => {
    spyOn(component.userAdded, 'emit');
    component.newUsername = '  bob  ';

    component.onAddUser();

    expect(component.userAdded.emit).toHaveBeenCalledWith('bob');
    expect(component.newUsername).toBe('');
  });

  it('should not emit userAdded if input is blank', () => {
    spyOn(component.userAdded, 'emit');
    component.newUsername = '   ';

    component.onAddUser();

    expect(component.userAdded.emit).not.toHaveBeenCalled();
  });

  it('should disable remove button when only one collaborator remains', () => {
    component.collaborators = [
      { id: 1, username: 'alice', displayName: 'Alice' }
    ];
    fixture.detectChanges();

    const removeBtn = fixture.debugElement.query(By.css('.btn-remove'));
    expect(removeBtn.nativeElement.disabled).toBeTrue();

    spyOn(component.userRemoved, 'emit');
    component.onRemoveUser(component.collaborators[0]);
    expect(component.userRemoved.emit).not.toHaveBeenCalled();
  });

  it('should emit userRemoved when there are multiple collaborators', () => {
    component.collaborators = [
      { id: 1, username: 'alice', displayName: 'Alice' },
      { id: 2, username: 'bob', displayName: 'Bob' }
    ];
    fixture.detectChanges();

    spyOn(component.userRemoved, 'emit');
    component.onRemoveUser(component.collaborators[1]);

    expect(component.userRemoved.emit).toHaveBeenCalledWith('bob');
  });

  it('should emit modalClosed when done or cancel is clicked', () => {
    spyOn(component.modalClosed, 'emit');
    component.onClose();
    expect(component.modalClosed.emit).toHaveBeenCalled();
  });
});

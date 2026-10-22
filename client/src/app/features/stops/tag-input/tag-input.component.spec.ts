import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagInputComponent } from './tag-input.component';

describe('TagInputComponent', () => {
  let component: TagInputComponent;
  let fixture: ComponentFixture<TagInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TagInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add tag on enter and emit changes', () => {
    component.tags = ['Trails'];
    component.inputValue = 'Water Access';

    spyOn(component.tagsChange, 'emit');

    component.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(component.tags).toEqual(['Trails', 'Water Access']);
    expect(component.tagsChange.emit).toHaveBeenCalledWith(['Trails', 'Water Access']);
    expect(component.inputValue).toBe('');
  });

  it('should not add duplicate tags (case-insensitive)', () => {
    component.tags = ['Trails'];
    component.inputValue = 'trails';

    spyOn(component.tagsChange, 'emit');

    component.addCurrentTag();

    expect(component.tags).toEqual(['Trails']);
    expect(component.tagsChange.emit).not.toHaveBeenCalled();
    expect(component.inputValue).toBe('');
  });

  it('should remove tag by index and emit changes', () => {
    component.tags = ['Trails', 'Scenic View', 'Laundry'];

    spyOn(component.tagsChange, 'emit');

    component.removeTag(1);

    expect(component.tags).toEqual(['Trails', 'Laundry']);
    expect(component.tagsChange.emit).toHaveBeenCalledWith(['Trails', 'Laundry']);
  });

  it('should filter available suggestions', () => {
    component.suggestions = ['Trails', 'Scenic View', 'Water Access', 'Laundry'];
    component.tags = ['trails', 'Laundry'];

    expect(component.availableSuggestions).toEqual(['Scenic View', 'Water Access']);
  });
});

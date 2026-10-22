import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tag-input-group">
      <label *ngIf="label" [for]="inputId">{{ label }}</label>
      <div class="tag-container" (click)="focusInput()">
        <span *ngFor="let tag of tags; let i = index" class="tag-chip">
          <span class="tag-text">{{ tag }}</span>
          <button type="button" class="remove-tag-btn" (click)="removeTag(i, $event)" aria-label="Remove tag">&times;</button>
        </span>
        <input
          #tagInputField
          [id]="inputId"
          type="text"
          class="tag-input-field"
          [placeholder]="tags.length === 0 ? placeholder : ''"
          [attr.list]="inputId + '-suggestions'"
          [(ngModel)]="inputValue"
          (keydown)="onKeyDown($event)"
          (blur)="onBlur()"
        />
        <datalist [id]="inputId + '-suggestions'">
          <option *ngFor="let suggestion of availableSuggestions" [value]="suggestion"></option>
        </datalist>
      </div>
    </div>
  `,
  styles: [`
    .tag-input-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      width: 100%;
    }

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #4b5563;
    }

    .tag-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.6rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background-color: #fff;
      min-height: 42px;
      cursor: text;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .tag-container:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.55rem;
      background-color: #e0f2fe;
      color: #0369a1;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .remove-tag-btn {
      background: none;
      border: none;
      color: #0369a1;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.15s;
    }

    .remove-tag-btn:hover {
      opacity: 1;
      color: #0c4a6e;
    }

    .tag-input-field {
      flex: 1;
      min-width: 120px;
      border: none;
      outline: none;
      font-size: 0.9rem;
      padding: 0.2rem 0.1rem;
      background: transparent;
      color: #1f2937;
    }

    .tag-input-field::placeholder {
      color: #9ca3af;
    }
  `]
})
export class TagInputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = 'Type and press Enter...';
  @Input() inputId: string = 'tag-input-' + Math.random().toString(36).substring(2, 9);
  @Input() suggestions: string[] = [];
  @Input() tags: string[] = [];
  @Output() tagsChange = new EventEmitter<string[]>();

  inputValue: string = '';

  get availableSuggestions(): string[] {
    const currentLower = new Set(this.tags.map(t => t.toLowerCase()));
    return this.suggestions.filter(s => !currentLower.has(s.toLowerCase()));
  }

  focusInput(): void {
    // Allows clicking anywhere inside the box to focus the input field
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addCurrentTag();
    } else if (event.key === 'Backspace' && this.inputValue.length === 0 && this.tags.length > 0) {
      this.removeTag(this.tags.length - 1);
    }
  }

  onBlur(): void {
    if (this.inputValue && this.inputValue.trim().length > 0) {
      this.addCurrentTag();
    }
  }

  addCurrentTag(): void {
    const trimmed = this.inputValue.trim().replace(/^,|,$/g, '').trim();
    if (trimmed.length > 0) {
      const exists = this.tags.some(t => t.toLowerCase() === trimmed.toLowerCase());
      if (!exists) {
        this.tags = [...this.tags, trimmed];
        this.tagsChange.emit(this.tags);
      }
      this.inputValue = '';
    }
  }

  removeTag(index: number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.tags = this.tags.filter((_, i) => i !== index);
    this.tagsChange.emit(this.tags);
  }
}

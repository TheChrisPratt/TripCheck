import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpdateTripDto } from '../../../models/trip.model';

@Component({
  selector: 'app-trip-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Edit Trip Details</h3>
          <button type="button" class="close-btn" (click)="onCancel()" aria-label="Close modal">&times;</button>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="editTripName">Trip Name *</label>
            <input
              id="editTripName"
              type="text"
              name="name"
              [(ngModel)]="tripData.name"
              placeholder="e.g. Pacific Coast Highway Roadtrip"
              required
              autofocus
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="editStartingDate">Starting Date *</label>
            <input
              id="editStartingDate"
              type="date"
              name="startingDate"
              [(ngModel)]="tripData.startingDate"
              required
              class="form-input"
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="!tripData.name.trim() || !tripData.startingDate"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: #ffffff;
      border-radius: 12px;
      width: 90%;
      max-width: 480px;
      padding: 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      color: #64748b;
      cursor: pointer;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #334155;
      margin-bottom: 6px;
    }
    .form-input {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 14px;
      font-size: 0.95rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }
    .btn {
      padding: 8px 18px;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }
    .btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class TripEditModalComponent implements OnInit {
  @Input() initialName: string = '';
  @Input() initialStartingDate: string = '';
  @Output() tripSubmitted = new EventEmitter<UpdateTripDto>();
  @Output() modalClosed = new EventEmitter<void>();

  tripData: UpdateTripDto = {
    name: '',
    startingDate: ''
  };

  ngOnInit(): void {
    this.tripData = {
      name: this.initialName || '',
      startingDate: this.initialStartingDate || ''
    };
  }

  onSubmit(): void {
    if (this.tripData.name.trim() && this.tripData.startingDate) {
      this.tripSubmitted.emit({
        name: this.tripData.name.trim(),
        startingDate: this.tripData.startingDate
      });
    }
  }

  onCancel(): void {
    this.modalClosed.emit();
  }
}

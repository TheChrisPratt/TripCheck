import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateStopDto } from '../../../models/stop.model';

@Component({
  selector: 'app-stop-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Add New Stop</h3>
          <button type="button" class="close-btn" (click)="onCancel()">&times;</button>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="stopName">Stop / Destination Name *</label>
              <input
                id="stopName"
                type="text"
                name="name"
                [(ngModel)]="stopData.name"
                placeholder="e.g. Grand Canyon South Rim"
                required
                class="form-input"
              />
            </div>
            <div class="form-group flex-1">
              <label for="stopNights">Nights *</label>
              <input
                id="stopNights"
                type="number"
                min="0"
                name="numberOfNights"
                [(ngModel)]="stopData.numberOfNights"
                required
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="stopLocation">Location / Address</label>
            <input
              id="stopLocation"
              type="text"
              name="location"
              [(ngModel)]="stopData.location"
              placeholder="e.g. Arizona, US"
              class="form-input"
            />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="stopPhone">Telephone Number</label>
              <input
                id="stopPhone"
                type="tel"
                name="telephoneNumber"
                [(ngModel)]="stopData.telephoneNumber"
                placeholder="(555) 000-0000"
                class="form-input"
              />
            </div>
            <div class="form-group flex-1">
              <label for="stopWeb">Web Address</label>
              <input
                id="stopWeb"
                type="url"
                name="webAddress"
                [(ngModel)]="stopData.webAddress"
                placeholder="https://..."
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="stopConfCode">Confirmation Code</label>
              <input
                id="stopConfCode"
                type="text"
                name="confirmationCode"
                [(ngModel)]="stopData.confirmationCode"
                placeholder="e.g. RES-987654"
                class="form-input"
              />
            </div>
            <div class="form-group flex-1">
              <label for="stopSiteNumber">Site / Room Number</label>
              <input
                id="stopSiteNumber"
                type="text"
                name="siteNumber"
                [(ngModel)]="stopData.siteNumber"
                placeholder="e.g. Site #42 / Room 204"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="stopNotes">Notes</label>
            <textarea
              id="stopNotes"
              rows="3"
              name="notes"
              [(ngModel)]="stopData.notes"
              placeholder="Check-in times, gate codes, amenities..."
              class="form-input textarea"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="!stopData.name.trim() || stopData.numberOfNights == null || stopData.numberOfNights < 0">
              Add Stop
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
      max-width: 580px;
      max-height: 90vh;
      overflow-y: auto;
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
    .form-row {
      display: flex;
      gap: 16px;
    }
    .flex-1 {
      flex: 1;
    }
    .flex-2 {
      flex: 2;
    }
    .form-group {
      margin-bottom: 16px;
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
      padding: 10px 12px;
      font-size: 0.95rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-input.textarea {
      resize: vertical;
    }
    .form-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
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
export class StopModalComponent {
  @Output() stopSubmitted = new EventEmitter<CreateStopDto>();
  @Output() modalClosed = new EventEmitter<void>();

  stopData: CreateStopDto = {
    name: '',
    location: '',
    numberOfNights: 1,
    webAddress: '',
    telephoneNumber: '',
    confirmationCode: '',
    siteNumber: '',
    notes: ''
  };

  onSubmit(): void {
    if (this.stopData.name.trim()) {
      this.stopSubmitted.emit({
        ...this.stopData,
        name: this.stopData.name.trim()
      });
    }
  }

  onCancel(): void {
    this.modalClosed.emit();
  }
}

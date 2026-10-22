import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Stop, UpdateStopDto } from '../../../models/stop.model';
import { TripService } from '../../../services/trip.service';
import { TagInputComponent } from '../tag-input/tag-input.component';

@Component({
  selector: 'app-stop-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TagInputComponent],
  template: `
    <div class="modal-backdrop" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Edit Stop</h3>
          <button type="button" class="close-btn" (click)="onCancel()" aria-label="Close modal">&times;</button>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group flex-2">
              <label for="editStopName">Stop / Destination Name *</label>
              <input
                id="editStopName"
                type="text"
                name="name"
                [(ngModel)]="stopData.name"
                placeholder="e.g. Grand Canyon South Rim"
                required
                autofocus
                class="form-input"
              />
            </div>
            <div class="form-group flex-1">
              <label for="editStopNights">Nights *</label>
              <input
                id="editStopNights"
                type="number"
                min="0"
                name="numberOfNights"
                [(ngModel)]="stopData.numberOfNights"
                required
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="editStopLocation">Location / Address</label>
              <input
                id="editStopLocation"
                type="text"
                name="location"
                [(ngModel)]="stopData.location"
                placeholder="e.g. Arizona, US"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="editStopCheckin">Check-in Time</label>
              <input
                id="editStopCheckin"
                type="time"
                name="checkinTime"
                [(ngModel)]="stopData.checkinTime"
                class="form-input"
              />
            </div>
            <div class="form-group flex-1">
              <label for="editStopCheckout">Check-out Time</label>
              <input
                id="editStopCheckout"
                type="time"
                name="checkoutTime"
                [(ngModel)]="stopData.checkoutTime"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Hookups</label>
            <div class="hookups-group">
              <label
                *ngFor="let hookup of hookupOptions"
                class="hookup-checkbox-label"
                [class.selected]="selectedHookups.has(hookup)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedHookups.has(hookup)"
                  (change)="toggleHookup(hookup)"
                />
                {{ hookup }}
              </label>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="editStopPhone">Telephone Number</label>
              <input
                id="editStopPhone"
                type="tel"
                name="telephoneNumber"
                [(ngModel)]="stopData.telephoneNumber"
                placeholder="(555) 000-0000"
                class="form-input"
              />
            </div>
            <div class="form-group flex-1">
              <label for="editStopWeb">Web Address</label>
              <input
                id="editStopWeb"
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
              <label for="editStopConfCode">Confirmation Code</label>
              <input
                id="editStopConfCode"
                type="text"
                name="confirmationCode"
                [(ngModel)]="stopData.confirmationCode"
                placeholder="e.g. RES-987654"
                class="form-input"
              />
            </div>
            <div class="form-group flex-1">
              <label for="editStopSiteNumber">Site / Room Number</label>
              <input
                id="editStopSiteNumber"
                type="text"
                name="siteNumber"
                [(ngModel)]="stopData.siteNumber"
                placeholder="e.g. Campsite #42 or Room 204"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="editStopCodes">Codes (Gate, Lockbox, WiFi)</label>
            <input
              id="editStopCodes"
              type="text"
              maxlength="128"
              name="codes"
              [(ngModel)]="stopData.codes"
              placeholder="e.g. Gate: #1234, WiFi: CanyonView, Keybox: 5678"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <app-tag-input
              [label]="'Amenities'"
              [placeholder]="'Add amenity (e.g. Trails, River Access)...'"
              [inputId]="'edit-stop-amenities-input'"
              [suggestions]="amenitySuggestions"
              [(tags)]="amenitiesList"
            />
          </div>

          <div class="form-group">
            <app-tag-input
              [label]="'Services'"
              [placeholder]="'Add service (e.g. Propane, Laundry)...'"
              [inputId]="'edit-stop-services-input'"
              [suggestions]="serviceSuggestions"
              [(tags)]="servicesList"
            />
          </div>

          <div class="form-group">
            <label for="editStopNotes">Notes &amp; Details</label>
            <textarea
              id="editStopNotes"
              name="notes"
              [(ngModel)]="stopData.notes"
              placeholder="e.g. Check-in after 3 PM. Gate code is #1234."
              rows="3"
              class="form-input textarea"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="!stopData.name.trim()">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .modal-content {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 100%;
      max-width: 620px;
      padding: 24px;
      box-sizing: border-box;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.2s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(12px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
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
    .hookups-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
    .hookup-checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: #334155;
      cursor: pointer;
      background: #f8fafc;
      padding: 6px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      user-select: none;
      transition: all 0.15s ease;
    }
    .hookup-checkbox-label:hover {
      background: #f1f5f9;
    }
    .hookup-checkbox-label.selected {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1d4ed8;
      font-weight: 500;
    }
    .hookup-checkbox-label input[type="checkbox"] {
      accent-color: #2563eb;
      cursor: pointer;
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
export class StopEditModalComponent implements OnInit {
  private tripService = inject(TripService);

  @Input({ required: true }) stop!: Stop;
  @Output() stopUpdated = new EventEmitter<UpdateStopDto>();
  @Output() modalClosed = new EventEmitter<void>();

  readonly hookupOptions = ['Electric', 'Water', 'Sewer'];
  selectedHookups: Set<string> = new Set();
  amenitiesList: string[] = [];
  servicesList: string[] = [];
  amenitySuggestions: string[] = [];
  serviceSuggestions: string[] = [];

  stopData: UpdateStopDto = {
    name: '',
    location: '',
    numberOfNights: 1,
    webAddress: '',
    telephoneNumber: '',
    confirmationCode: '',
    siteNumber: '',
    notes: '',
    checkinTime: '',
    checkoutTime: '',
    codes: ''
  };

  ngOnInit(): void {
    if (this.stop) {
      this.stopData = {
        name: this.stop.name || '',
        location: this.stop.location || '',
        numberOfNights: this.stop.numberOfNights ?? 1,
        webAddress: this.stop.webAddress || '',
        telephoneNumber: this.stop.telephoneNumber || '',
        confirmationCode: this.stop.confirmationCode || '',
        siteNumber: this.stop.siteNumber || '',
        notes: this.stop.notes || '',
        checkinTime: this.stop.checkinTime || '',
        checkoutTime: this.stop.checkoutTime || '',
        codes: this.stop.codes || ''
      };
      this.selectedHookups = new Set(this.stop.hookups || []);
      this.amenitiesList = this.stop.amenities ? [...this.stop.amenities] : [];
      this.servicesList = this.stop.services ? [...this.stop.services] : [];
    }

    this.tripService.getAmenities().subscribe({
      next: (amenities) => {
        this.amenitySuggestions = amenities || [];
      },
      error: () => {}
    });

    this.tripService.getServices().subscribe({
      next: (services) => {
        this.serviceSuggestions = services || [];
      },
      error: () => {}
    });
  }

  toggleHookup(hookup: string): void {
    if (this.selectedHookups.has(hookup)) {
      this.selectedHookups.delete(hookup);
    } else {
      this.selectedHookups.add(hookup);
    }
  }

  onSubmit(): void {
    if (this.stopData.name.trim()) {
      this.stopUpdated.emit({
        ...this.stopData,
        name: this.stopData.name.trim(),
        hookups: Array.from(this.selectedHookups),
        amenities: this.amenitiesList,
        services: this.servicesList
      });
    }
  }

  onCancel(): void {
    this.modalClosed.emit();
  }
}

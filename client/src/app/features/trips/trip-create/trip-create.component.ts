import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TripService } from '../../../services/trip.service';
import { CreateTripDto } from '../../../models/trip.model';

@Component({
  selector: 'app-trip-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="create-trip-container">
      <div class="create-trip-card">
        <div class="card-header">
          <a routerLink="/trips" class="back-link">&larr; Back to Trips</a>
          <h2>Plan a New Adventure</h2>
          <p class="subtitle">Enter your trip details to begin creating checklists and itinerary stops.</p>
        </div>

        @if (errorMessage()) {
          <div class="error-alert">{{ errorMessage() }}</div>
        }

        <form (ngSubmit)="onSubmit()" class="trip-form">
          <div class="form-group">
            <label for="tripName">Trip Name *</label>
            <input
              id="tripName"
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
            <label for="startingDate">Starting Date *</label>
            <input
              id="startingDate"
              type="date"
              name="startingDate"
              [(ngModel)]="tripData.startingDate"
              required
              class="form-input"
            />
          </div>

          <div class="form-actions">
            <a routerLink="/trips" class="btn btn-secondary">Cancel</a>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isSubmitting() || !tripData.name.trim() || !tripData.startingDate"
            >
              {{ isSubmitting() ? 'Creating Trip...' : 'Create Trip & Start Planning' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .create-trip-container {
      max-width: 600px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .create-trip-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .back-link {
      display: inline-block;
      color: #64748b;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 12px;
    }
    .back-link:hover {
      color: #2563eb;
    }
    .card-header h2 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: #0f172a;
    }
    .subtitle {
      margin: 8px 0 24px 0;
      font-size: 0.9rem;
      color: #64748b;
    }
    .error-alert {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 10px 14px;
      border-radius: 0 6px 6px 0;
      color: #991b1b;
      font-size: 0.875rem;
      margin-bottom: 20px;
    }
    .trip-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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
      padding: 11px 14px;
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
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 10px;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      text-decoration: none;
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
export class TripCreateComponent {
  private tripService = inject(TripService);
  private router = inject(Router);

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  tripData: CreateTripDto = {
    name: '',
    startingDate: new Date().toISOString().split('T')[0]
  };

  onSubmit(): void {
    if (!this.tripData.name.trim() || !this.tripData.startingDate) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.tripService.createTrip({
      name: this.tripData.name.trim(),
      startingDate: this.tripData.startingDate
    }).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/trips', created.id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to create trip.');
      }
    });
  }
}

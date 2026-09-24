import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TripService } from '../../../services/trip.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TripSummary } from '../../../models/trip.model';

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="trips-container">
      <div class="page-header">
        <div>
          <h2>My Adventures</h2>
          <p class="subtitle">Organize and manage your upcoming and ongoing trips</p>
        </div>
        <a routerLink="/trips/new" class="btn btn-primary">+ Create New Trip</a>
      </div>

      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading your trips...</p>
        </div>
      } @else if (errorMessage()) {
        <div class="error-state">
          <p>{{ errorMessage() }}</p>
          <button type="button" class="btn btn-secondary" (click)="loadTrips()">Retry</button>
        </div>
      } @else if (trips().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🗺️</div>
          <h3>No trips planned yet</h3>
          <p>Create your first trip to start generating custom packing lists and itinerary stops.</p>
          <a routerLink="/trips/new" class="btn btn-primary">Start Planning a Trip</a>
        </div>
      } @else {
        <div class="trips-grid">
          @for (trip of trips(); track trip.id) {
            <div class="trip-card">
              <div class="card-top">
                <h3 class="trip-title">
                  <a [routerLink]="['/trips', trip.id]">{{ trip.name }}</a>
                </h3>
                <button
                  type="button"
                  class="delete-btn"
                  (click)="onDeleteTrip(trip)"
                  title="Delete trip"
                >
                  &times;
                </button>
              </div>

              <div class="trip-dates">
                <span class="icon">📅</span>
                <span>{{ trip.startingDate | date:'mediumDate' }} &rarr; {{ trip.endingDate | date:'mediumDate' }}</span>
              </div>

              <div class="trip-stats">
                <div class="stat-badge">
                  <span class="stat-num">{{ trip.stopCount }}</span>
                  <span class="stat-label">{{ trip.stopCount === 1 ? 'Stop' : 'Stops' }}</span>
                </div>
                <div class="stat-badge">
                  <span class="stat-num">{{ trip.completedTaskCount }}/{{ trip.totalTaskCount }}</span>
                  <span class="stat-label">Tasks Done</span>
                </div>
              </div>

              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  [style.width.%]="getProgressPercentage(trip)"
                ></div>
              </div>

              <div class="card-actions">
                <a [routerLink]="['/trips', trip.id]" class="btn-view">View Details & Checklists &rarr;</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .trips-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 30px 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .page-header h2 {
      margin: 0;
      font-size: 1.85rem;
      font-weight: 700;
      color: #0f172a;
    }
    .subtitle {
      margin: 6px 0 0 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }
    .loading-state, .error-state, .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }
    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #0f172a;
    }
    .empty-state p {
      color: #64748b;
      margin-bottom: 24px;
      max-width: 450px;
      margin-left: auto;
      margin-right: auto;
    }
    .trips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .trip-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .trip-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .trip-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .trip-title a {
      color: #0f172a;
      text-decoration: none;
    }
    .trip-title a:hover {
      color: #2563eb;
    }
    .delete-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .delete-btn:hover {
      color: #ef4444;
      background: #fee2e2;
    }
    .trip-dates {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 16px;
    }
    .trip-stats {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .stat-badge {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .stat-num {
      font-weight: 700;
      color: #0f172a;
    }
    .stat-label {
      color: #64748b;
    }
    .progress-bar-bg {
      height: 6px;
      background: #f1f5f9;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 18px;
    }
    .progress-bar-fill {
      height: 100%;
      background: #22c55e;
      transition: width 0.3s ease;
    }
    .card-actions {
      margin-top: auto;
    }
    .btn-view {
      display: inline-block;
      font-size: 0.9rem;
      font-weight: 600;
      color: #2563eb;
      text-decoration: none;
    }
    .btn-view:hover {
      text-decoration: underline;
    }
  `]
})
export class TripListComponent implements OnInit {
  private tripService = inject(TripService);
  authService = inject(AuthService);

  trips = signal<TripSummary[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.tripService.getTrips().subscribe({
      next: (data) => {
        this.trips.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load trips.');
        this.isLoading.set(false);
      }
    });
  }

  getProgressPercentage(trip: TripSummary): number {
    if (!trip.totalTaskCount || trip.totalTaskCount === 0) return 0;
    return Math.round((trip.completedTaskCount / trip.totalTaskCount) * 100);
  }

  onDeleteTrip(trip: TripSummary): void {
    if (confirm(`Are you sure you want to delete "${trip.name}"?`)) {
      this.tripService.deleteTrip(trip.id).subscribe({
        next: () => {
          this.trips.update((list) => list.filter((t) => t.id !== trip.id));
        },
        error: (err) => {
          alert(err?.error?.message || 'Failed to delete trip.');
        }
      });
    }
  }
}

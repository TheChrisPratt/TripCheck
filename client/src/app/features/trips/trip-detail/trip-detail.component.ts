import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TripService } from '../../../services/trip.service';
import { TripDetail } from '../../../models/trip.model';
import { Task, TaskStatus } from '../../../models/task.model';
import { CreateStopDto } from '../../../models/stop.model';
import { TaskItemComponent } from '../../tasks/task-item/task-item.component';
import { TaskModalComponent } from '../../tasks/task-modal/task-modal.component';
import { StopCardComponent } from '../../stops/stop-card/stop-card.component';
import { StopModalComponent } from '../../stops/stop-modal/stop-modal.component';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TaskItemComponent,
    TaskModalComponent,
    StopCardComponent,
    StopModalComponent
  ],
  template: `
    <div class="trip-detail-container">
      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading trip details...</p>
        </div>
      } @else if (errorMessage()) {
        <div class="error-state">
          <p>{{ errorMessage() }}</p>
          <a routerLink="/trips" class="btn btn-secondary">&larr; Back to Trips</a>
        </div>
      } @else if (trip()) {
        <div class="trip-content">
          <!-- Header Banner -->
          <div class="trip-header-card">
            <div class="header-nav">
              <a routerLink="/trips" class="back-link">&larr; All Trips</a>
            </div>
            <div class="header-main">
              <div>
                <h1 class="trip-title">{{ trip()!.name }}</h1>
                <div class="trip-meta">
                  <span class="date-badge">
                    📅 {{ trip()!.startingDate | date:'mediumDate' }} &rarr; {{ trip()!.endingDate | date:'mediumDate' }}
                  </span>
                  <span class="count-badge">
                    📍 {{ trip()!.stops.length }} {{ trip()!.stops.length === 1 ? 'Stop' : 'Stops' }}
                  </span>
                </div>
              </div>
              <button type="button" class="btn btn-primary" (click)="showAddStopModal = true">
                + Add Stop to Trip
              </button>
            </div>
          </div>

          <!-- Section 1: Pre-Trip Checklist -->
          <div class="checklist-card">
            <div class="section-title-bar">
              <div class="title-with-badge">
                <h3>📋 Pre-Trip Checklist</h3>
                <span class="badge">{{ getCompletedCount(trip()!.preTripTasks) }}/{{ trip()!.preTripTasks.length }}</span>
              </div>
              <button type="button" class="btn-sm" (click)="showPreTripModal = true">+ Add Task</button>
            </div>
            <p class="section-subtitle">Items to pack, reservations to confirm, and tasks to complete before departing.</p>
            <div class="task-list">
              @for (task of trip()!.preTripTasks; track task.id) {
                <app-task-item
                  [task]="task"
                  (statusChange)="onTaskStatusChange($event)"
                  (deleteTask)="onTaskDelete($event)"
                />
              } @empty {
                <div class="empty-hint">No pre-trip tasks added yet.</div>
              }
            </div>
          </div>

          <!-- Section 2: Day of Departure Checklist -->
          <div class="checklist-card">
            <div class="section-title-bar">
              <div class="title-with-badge">
                <h3>🚗 Day of Departure Checklist</h3>
                <span class="badge">{{ getCompletedCount(trip()!.departureDayTasks) }}/{{ trip()!.departureDayTasks.length }}</span>
              </div>
              <button type="button" class="btn-sm" (click)="showDepartureDayModal = true">+ Add Task</button>
            </div>
            <p class="section-subtitle">Last-minute checks before walking out the door (lock doors, set thermostats, load vehicle).</p>
            <div class="task-list">
              @for (task of trip()!.departureDayTasks; track task.id) {
                <app-task-item
                  [task]="task"
                  (statusChange)="onTaskStatusChange($event)"
                  (deleteTask)="onTaskDelete($event)"
                />
              } @empty {
                <div class="empty-hint">No departure day tasks added yet.</div>
              }
            </div>
          </div>

          <!-- Section 3: Itinerary Stops Timeline -->
          <div class="stops-section">
            <div class="stops-section-header">
              <div>
                <h2>🗺️ Itinerary & Stops</h2>
                <p class="subtitle">Chronological destinations, nights stayed, and arrival/departure checklists.</p>
              </div>
              <button type="button" class="btn btn-outline" (click)="showAddStopModal = true">
                + Add Destination Stop
              </button>
            </div>

            <div class="stops-list">
              @for (stop of trip()!.stops; track stop.id) {
                <app-stop-card
                  [stop]="stop"
                  (deleteStop)="onDeleteStop($event)"
                  (addArrivalTask)="onAddArrivalTask($event)"
                  (addDepartureTask)="onAddDepartureTask($event)"
                  (taskStatusChange)="onTaskStatusChange($event)"
                  (taskDelete)="onTaskDelete($event)"
                />
              } @empty {
                <div class="empty-stops-card">
                  <p>No stops added to this trip yet.</p>
                  <button type="button" class="btn btn-primary" (click)="showAddStopModal = true">
                    Add First Stop
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Section 4: Day of Return Checklist -->
          <div class="checklist-card">
            <div class="section-title-bar">
              <div class="title-with-badge">
                <h3>🏡 Day of Return Checklist</h3>
                <span class="badge">{{ getCompletedCount(trip()!.returnDayTasks) }}/{{ trip()!.returnDayTasks.length }}</span>
              </div>
              <button type="button" class="btn-sm" (click)="showReturnDayModal = true">+ Add Task</button>
            </div>
            <p class="section-subtitle">Tasks when arriving back home (unpack gear, check mail, review expenses).</p>
            <div class="task-list">
              @for (task of trip()!.returnDayTasks; track task.id) {
                <app-task-item
                  [task]="task"
                  (statusChange)="onTaskStatusChange($event)"
                  (deleteTask)="onTaskDelete($event)"
                />
              } @empty {
                <div class="empty-hint">No return day tasks added yet.</div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Modals -->
      @if (showPreTripModal) {
        <app-task-modal
          title="Add Pre-Trip Task"
          (taskSubmitted)="onAddPreTripTask($event)"
          (modalClosed)="showPreTripModal = false"
        />
      }

      @if (showDepartureDayModal) {
        <app-task-modal
          title="Add Day of Departure Task"
          (taskSubmitted)="onAddDepartureDayTask($event)"
          (modalClosed)="showDepartureDayModal = false"
        />
      }

      @if (showReturnDayModal) {
        <app-task-modal
          title="Add Day of Return Task"
          (taskSubmitted)="onAddReturnDayTask($event)"
          (modalClosed)="showReturnDayModal = false"
        />
      }

      @if (showAddStopModal) {
        <app-stop-modal
          (stopSubmitted)="onAddStop($event)"
          (modalClosed)="showAddStopModal = false"
        />
      }
    </div>
  `,
  styles: [`
    .trip-detail-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 30px 20px 60px 20px;
    }
    .trip-header-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 28px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
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
    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .trip-title {
      margin: 0 0 10px 0;
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
    }
    .trip-meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .date-badge, .count-badge {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      color: #334155;
    }
    .checklist-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 28px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    }
    .section-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .title-with-badge h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #0f172a;
    }
    .badge {
      background: #eff6ff;
      color: #2563eb;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .section-subtitle {
      margin: 0 0 16px 0;
      font-size: 0.875rem;
      color: #64748b;
    }
    .task-list {
      display: flex;
      flex-direction: column;
    }
    .empty-hint {
      font-size: 0.9rem;
      color: #94a3b8;
      font-style: italic;
      padding: 12px 0;
    }
    .stops-section {
      margin: 36px 0;
    }
    .stops-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .stops-section-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
    }
    .stops-section-header .subtitle {
      margin: 4px 0 0 0;
      font-size: 0.875rem;
      color: #64748b;
    }
    .empty-stops-card {
      background: #ffffff;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      color: #64748b;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
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
    .btn-outline {
      background: #ffffff;
      border: 1px solid #2563eb;
      color: #2563eb;
    }
    .btn-outline:hover {
      background: #eff6ff;
    }
    .btn-sm {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-sm:hover {
      background: #e2e8f0;
    }
    .loading-state, .error-state {
      text-align: center;
      padding: 60px 20px;
    }
  `]
})
export class TripDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);

  trip = signal<TripDetail | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  showPreTripModal = false;
  showDepartureDayModal = false;
  showReturnDayModal = false;
  showAddStopModal = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idStr = params.get('id');
      if (idStr) {
        this.loadTrip(Number(idStr));
      }
    });
  }

  loadTrip(tripId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.tripService.getTrip(tripId).subscribe({
      next: (data) => {
        this.trip.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load trip details.');
        this.isLoading.set(false);
      }
    });
  }

  getCompletedCount(tasks: Task[]): number {
    if (!tasks) return 0;
    return tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  }

  onTaskStatusChange(event: { task: Task; newStatus: TaskStatus }): void {
    // Optimistic update
    const previousStatus = event.task.status;
    event.task.status = event.newStatus;

    this.tripService.updateTaskStatus(event.task.id, event.newStatus).subscribe({
      next: (updatedTask) => {
        event.task.status = updatedTask.status;
      },
      error: () => {
        event.task.status = previousStatus;
      }
    });
  }

  onTaskDelete(task: Task): void {
    if (confirm(`Delete task "${task.description}"?`)) {
      this.tripService.deleteTask(task.id).subscribe({
        next: () => {
          if (this.trip()) {
            this.loadTrip(this.trip()!.id);
          }
        },
        error: (err) => {
          alert(err?.error?.message || 'Failed to delete task.');
        }
      });
    }
  }

  onAddPreTripTask(description: string): void {
    if (!this.trip()) return;
    this.tripService.addPreTripTask(this.trip()!.id, { description }).subscribe({
      next: () => {
        this.showPreTripModal = false;
        this.loadTrip(this.trip()!.id);
      },
      error: (err) => alert(err?.error?.message || 'Failed to add task.')
    });
  }

  onAddDepartureDayTask(description: string): void {
    if (!this.trip()) return;
    this.tripService.addDepartureDayTask(this.trip()!.id, { description }).subscribe({
      next: () => {
        this.showDepartureDayModal = false;
        this.loadTrip(this.trip()!.id);
      },
      error: (err) => alert(err?.error?.message || 'Failed to add task.')
    });
  }

  onAddReturnDayTask(description: string): void {
    if (!this.trip()) return;
    this.tripService.addReturnDayTask(this.trip()!.id, { description }).subscribe({
      next: () => {
        this.showReturnDayModal = false;
        this.loadTrip(this.trip()!.id);
      },
      error: (err) => alert(err?.error?.message || 'Failed to add task.')
    });
  }

  onAddStop(dto: CreateStopDto): void {
    if (!this.trip()) return;
    this.tripService.addStop(this.trip()!.id, dto).subscribe({
      next: () => {
        this.showAddStopModal = false;
        this.loadTrip(this.trip()!.id);
      },
      error: (err) => alert(err?.error?.message || 'Failed to add stop.')
    });
  }

  onDeleteStop(stopId: number): void {
    this.tripService.deleteStop(stopId).subscribe({
      next: () => {
        if (this.trip()) {
          this.loadTrip(this.trip()!.id);
        }
      },
      error: (err) => alert(err?.error?.message || 'Failed to delete stop.')
    });
  }

  onAddArrivalTask(event: { stopId: number; description: string }): void {
    this.tripService.addArrivalTask(event.stopId, { description: event.description }).subscribe({
      next: () => {
        if (this.trip()) {
          this.loadTrip(this.trip()!.id);
        }
      },
      error: (err) => alert(err?.error?.message || 'Failed to add arrival task.')
    });
  }

  onAddDepartureTask(event: { stopId: number; description: string }): void {
    this.tripService.addDepartureTask(event.stopId, { description: event.description }).subscribe({
      next: () => {
        if (this.trip()) {
          this.loadTrip(this.trip()!.id);
        }
      },
      error: (err) => alert(err?.error?.message || 'Failed to add departure task.')
    });
  }
}

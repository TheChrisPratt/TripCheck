import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stop } from '../../../models/stop.model';
import { Task, TaskStatus } from '../../../models/task.model';
import { TaskItemComponent } from '../../tasks/task-item/task-item.component';
import { TaskModalComponent } from '../../tasks/task-modal/task-modal.component';

@Component({
  selector: 'app-stop-card',
  standalone: true,
  imports: [CommonModule, TaskItemComponent, TaskModalComponent],
  template: `
    <div class="stop-card">
      <div class="stop-header">
        <div class="stop-title-area">
          <div class="stop-badge">Stop #{{ stop.orderIndex + 1 }}</div>
          <h3 class="stop-name">{{ stop.name }}</h3>
          <div class="stop-date-badge">{{ stop.stopDate | date:'mediumDate' }} &bull; {{ stop.numberOfNights }} {{ stop.numberOfNights === 1 ? 'night' : 'nights' }}</div>
        </div>
        <button type="button" class="btn-delete-stop" (click)="onDeleteStop()" title="Delete stop">
          &times;
        </button>
      </div>

      <div class="stop-details-grid">
        @if (stop.location) {
          <div class="detail-item">
            <span class="detail-label">Location:</span>
            <span class="detail-value">{{ stop.location }}</span>
          </div>
        }
        @if (stop.telephoneNumber) {
          <div class="detail-item">
            <span class="detail-label">Phone:</span>
            <a [href]="'tel:' + stop.telephoneNumber" class="detail-link">{{ stop.telephoneNumber }}</a>
          </div>
        }
        @if (stop.webAddress) {
          <div class="detail-item">
            <span class="detail-label">Website:</span>
            <a [href]="stop.webAddress" target="_blank" rel="noopener" class="detail-link">{{ stop.webAddress }}</a>
          </div>
        }
        @if (stop.confirmationCode) {
          <div class="detail-item">
            <span class="detail-label">Conf Code:</span>
            <span class="detail-badge">{{ stop.confirmationCode }}</span>
          </div>
        }
        @if (stop.siteNumber) {
          <div class="detail-item">
            <span class="detail-label">Site / Room:</span>
            <span class="detail-value">{{ stop.siteNumber }}</span>
          </div>
        }
      </div>

      @if (stop.notes) {
        <div class="stop-notes">
          <span class="detail-label">Notes:</span>
          <p>{{ stop.notes }}</p>
        </div>
      }

      <div class="stop-tasks-container">
        <!-- Arrival Tasks -->
        <div class="tasks-section" [class.is-collapsed]="isArrivalCollapsed()">
          <div class="section-header">
            <button
              type="button"
              class="task-toggle-btn"
              (click)="toggleArrival()"
              [attr.aria-expanded]="!isArrivalCollapsed()"
              aria-label="Toggle Arrival Tasks"
            >
              <span class="collapse-icon">{{ isArrivalCollapsed() ? '▶' : '▼' }}</span>
              <h4>Arrival Tasks ({{ completedArrivalTasksCount }}/{{ stop.arrivalTasks.length }})</h4>
            </button>
            <button type="button" class="btn-add-task" (click)="showArrivalModal = true">+ Add Task</button>
          </div>
          @if (!isArrivalCollapsed()) {
            <div class="tasks-list">
              @for (task of stop.arrivalTasks; track task.id) {
                <app-task-item
                  [task]="task"
                  (statusChange)="onTaskStatusChange($event)"
                  (deleteTask)="onTaskDelete($event)"
                />
              } @empty {
                <div class="empty-tasks">No arrival tasks added.</div>
              }
            </div>
          }
        </div>

        <!-- Departure Tasks -->
        <div class="tasks-section" [class.is-collapsed]="isDepartureCollapsed()">
          <div class="section-header">
            <button
              type="button"
              class="task-toggle-btn"
              (click)="toggleDeparture()"
              [attr.aria-expanded]="!isDepartureCollapsed()"
              aria-label="Toggle Departure Tasks"
            >
              <span class="collapse-icon">{{ isDepartureCollapsed() ? '▶' : '▼' }}</span>
              <h4>Departure Tasks ({{ completedDepartureTasksCount }}/{{ stop.departureTasks.length }})</h4>
            </button>
            <button type="button" class="btn-add-task" (click)="showDepartureModal = true">+ Add Task</button>
          </div>
          @if (!isDepartureCollapsed()) {
            <div class="tasks-list">
              @for (task of stop.departureTasks; track task.id) {
                <app-task-item
                  [task]="task"
                  (statusChange)="onTaskStatusChange($event)"
                  (deleteTask)="onTaskDelete($event)"
                />
              } @empty {
                <div class="empty-tasks">No departure tasks added.</div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Arrival Task Modal -->
      @if (showArrivalModal) {
        <app-task-modal
          title="Add Arrival Task for {{ stop.name }}"
          (taskSubmitted)="onAddArrivalTask($event)"
          (modalClosed)="showArrivalModal = false"
        />
      }

      <!-- Departure Task Modal -->
      @if (showDepartureModal) {
        <app-task-modal
          title="Add Departure Task for {{ stop.name }}"
          (taskSubmitted)="onAddDepartureTask($event)"
          (modalClosed)="showDepartureModal = false"
        />
      }
    </div>
  `,
  styles: [`
    .stop-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    }
    .stop-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 14px;
    }
    .stop-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      background: #eff6ff;
      color: #2563eb;
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .stop-name {
      margin: 2px 0 6px 0;
      font-size: 1.35rem;
      font-weight: 600;
      color: #0f172a;
    }
    .stop-date-badge {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }
    .btn-delete-stop {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
      border-radius: 4px;
      padding: 4px 8px;
    }
    .btn-delete-stop:hover {
      color: #ef4444;
      background: #fee2e2;
    }
    .stop-details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
      font-size: 0.875rem;
    }
    .detail-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .detail-label {
      color: #64748b;
      font-weight: 500;
    }
    .detail-value {
      color: #1e293b;
      font-weight: 500;
    }
    .detail-link {
      color: #2563eb;
      text-decoration: none;
      word-break: break-all;
    }
    .detail-link:hover {
      text-decoration: underline;
    }
    .detail-badge {
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.85rem;
      color: #0f172a;
    }
    .stop-notes {
      background: #f8fafc;
      border-left: 3px solid #cbd5e1;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 16px;
      font-size: 0.875rem;
    }
    .stop-notes p {
      margin: 4px 0 0 0;
      color: #334155;
      white-space: pre-wrap;
    }
    .stop-tasks-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 16px;
    }
    @media (max-width: 768px) {
      .stop-tasks-container {
        grid-template-columns: 1fr;
      }
    }
    .tasks-section {
      background: #f8fafc;
      border-radius: 8px;
      padding: 14px;
      border: 1px solid #f1f5f9;
    }
    .tasks-section.is-collapsed {
      padding: 10px 14px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .tasks-section.is-collapsed .section-header {
      margin-bottom: 0;
    }
    .task-toggle-btn {
      background: none;
      border: none;
      padding: 2px 4px;
      margin-left: -4px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font: inherit;
      text-align: left;
      transition: background-color 0.15s ease;
    }
    .task-toggle-btn:hover {
      background-color: #e2e8f0;
    }
    .task-toggle-btn h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #334155;
    }
    .collapse-icon {
      font-size: 0.75rem;
      color: #64748b;
      width: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    .btn-add-task {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 0.8rem;
      color: #2563eb;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-add-task:hover {
      background: #eff6ff;
      border-color: #93c5fd;
    }
    .empty-tasks {
      font-size: 0.85rem;
      color: #94a3b8;
      font-style: italic;
      padding: 6px 0;
    }
  `]
})
export class StopCardComponent {
  @Input({ required: true }) stop!: Stop;
  @Output() deleteStop = new EventEmitter<number>();
  @Output() addArrivalTask = new EventEmitter<{ stopId: number; description: string }>();
  @Output() addDepartureTask = new EventEmitter<{ stopId: number; description: string }>();
  @Output() taskStatusChange = new EventEmitter<{ task: Task; newStatus: TaskStatus }>();
  @Output() taskDelete = new EventEmitter<Task>();

  showArrivalModal = false;
  showDepartureModal = false;

  isArrivalCollapsed = signal<boolean>(false);
  isDepartureCollapsed = signal<boolean>(false);

  toggleArrival(): void {
    this.isArrivalCollapsed.update((v) => !v);
  }

  toggleDeparture(): void {
    this.isDepartureCollapsed.update((v) => !v);
  }

  get completedArrivalTasksCount(): number {
    return this.stop.arrivalTasks?.filter((t) => t.status === TaskStatus.COMPLETED).length || 0;
  }

  get completedDepartureTasksCount(): number {
    return this.stop.departureTasks?.filter((t) => t.status === TaskStatus.COMPLETED).length || 0;
  }

  onDeleteStop(): void {
    if (confirm(`Are you sure you want to delete stop "${this.stop.name}"?`)) {
      this.deleteStop.emit(this.stop.id);
    }
  }

  onAddArrivalTask(description: string): void {
    this.addArrivalTask.emit({ stopId: this.stop.id, description });
    this.showArrivalModal = false;
  }

  onAddDepartureTask(description: string): void {
    this.addDepartureTask.emit({ stopId: this.stop.id, description });
    this.showDepartureModal = false;
  }

  onTaskStatusChange(event: { task: Task; newStatus: TaskStatus }): void {
    this.taskStatusChange.emit(event);
  }

  onTaskDelete(task: Task): void {
    this.taskDelete.emit(task);
  }
}

import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Stop } from '../../../models/stop.model';
import { Task, TaskStatus } from '../../../models/task.model';
import { TripService } from '../../../services/trip.service';
import { TaskItemComponent } from '../../tasks/task-item/task-item.component';
import { TaskModalComponent } from '../../tasks/task-modal/task-modal.component';

@Component({
  selector: 'app-stop-card',
  standalone: true,
  imports: [CommonModule, TaskItemComponent, TaskModalComponent],
  template: `
    <div
      class="stop-card"
      [class.is-collapsed]="isCollapsed()"
      [class.is-dragging]="isDragging"
      [class.is-drag-over]="isDragOver"
      (dragover)="onStopDragOver($event)"
      (dragleave)="onStopDragLeave($event)"
      (drop)="onStopDrop($event)"
    >
      <div class="stop-header">
        <div class="stop-title-area">
          <div
            class="drag-handle stop-drag-handle"
            draggable="true"
            (dragstart)="onStopDragStart($event)"
            (dragend)="onStopDragEnd()"
            title="Drag to reorder stop"
            aria-label="Drag to reorder stop"
          >
            <span class="handle-icon" aria-hidden="true">&#x283F;</span>
          </div>
          <button
            type="button"
            class="stop-toggle-btn"
            (click)="toggleCollapse()"
            [attr.aria-expanded]="!isCollapsed()"
            [attr.aria-label]="isCollapsed() ? 'Expand stop' : 'Collapse stop'"
            title="{{ isCollapsed() ? 'Expand stop' : 'Collapse stop' }}"
          >
            <span class="collapse-icon">{{ isCollapsed() ? '▶' : '▼' }}</span>
          </button>
          <div class="stop-badge">Stop #{{ (stop.orderIndex !== undefined && stop.orderIndex !== null) ? stop.orderIndex + 1 : index + 1 }}</div>
          <h3 class="stop-name">{{ stop.name }}</h3>
          <div class="stop-date-badge">{{ stop.stopDate | date:'mediumDate' }} &bull; {{ stop.numberOfNights }} {{ stop.numberOfNights === 1 ? 'night' : 'nights' }}</div>
        </div>
        <div class="stop-header-actions">
          <button type="button" class="btn-edit-stop" (click)="onEditStop()" title="Edit stop" aria-label="Edit stop">
            ✏️ Edit
          </button>
          <button type="button" class="btn-clone-stop" (click)="onCloneStop()" title="Clone stop" aria-label="Clone stop">
            📋 Clone
          </button>
          <button type="button" class="btn-delete-stop" (click)="onDeleteStop()" title="Delete stop" aria-label="Delete stop">
            &times;
          </button>
        </div>
      </div>

      @if (!isCollapsed()) {
        <div class="stop-details-grid">
          @if (stop.location) {
            <div class="detail-item">
              <span class="detail-label">Location:</span>
              <span class="detail-value">{{ stop.location }}</span>
            </div>
          }
          @if (stop.checkinTime) {
            <div class="detail-item">
              <span class="detail-label">Check-in:</span>
              <span class="detail-value">{{ formatTime(stop.checkinTime) }}</span>
            </div>
          }
          @if (stop.checkoutTime) {
            <div class="detail-item">
              <span class="detail-label">Check-out:</span>
              <span class="detail-value">{{ formatTime(stop.checkoutTime) }}</span>
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
          @if (stop.codes) {
            <div class="detail-item full-width">
              <span class="detail-label">Codes:</span>
              <span class="codes-badge">{{ stop.codes }}</span>
            </div>
          }
          @if (stop.hookups && stop.hookups.length > 0) {
            <div class="detail-item full-width">
              <span class="detail-label">Hookups:</span>
              <div class="hookup-badges">
                @for (hookup of stop.hookups; track hookup) {
                  <span class="hookup-badge">{{ hookup }}</span>
                }
              </div>
            </div>
          }
          @if (stop.amenities && stop.amenities.length > 0) {
            <div class="detail-item full-width">
              <span class="detail-label">Amenities:</span>
              <div class="tag-chips-list">
                @for (amenity of stop.amenities; track amenity) {
                  <span class="feature-chip amenity-chip">{{ amenity }}</span>
                }
              </div>
            </div>
          }
          @if (stop.services && stop.services.length > 0) {
            <div class="detail-item full-width">
              <span class="detail-label">Services:</span>
              <div class="tag-chips-list">
                @for (service of stop.services; track service) {
                  <span class="feature-chip service-chip">{{ service }}</span>
                }
              </div>
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
                @for (task of stop.arrivalTasks; track task.id; let i = $index) {
                  <app-task-item
                    [task]="task"
                    [index]="i"
                    [isDragging]="draggedState?.listType === 'arrival' && draggedState?.index === i"
                    [isDragOver]="dragOverState?.listType === 'arrival' && dragOverState?.index === i"
                    (statusChange)="onTaskStatusChange($event)"
                    (editTask)="onTaskEdit($event)"
                    (deleteTask)="onTaskDelete($event)"
                    (itemDragStart)="onTaskDragStart($event.event, 'arrival', i)"
                    (itemDragOver)="onTaskDragOver($event.event, 'arrival', i)"
                    (itemDragLeave)="onTaskDragLeave($event.event, 'arrival', i)"
                    (itemDrop)="onTaskDrop($event.event, 'arrival', i)"
                    (itemDragEnd)="onTaskDragEnd()"
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
                @for (task of stop.departureTasks; track task.id; let i = $index) {
                  <app-task-item
                    [task]="task"
                    [index]="i"
                    [isDragging]="draggedState?.listType === 'departure' && draggedState?.index === i"
                    [isDragOver]="dragOverState?.listType === 'departure' && dragOverState?.index === i"
                    (statusChange)="onTaskStatusChange($event)"
                    (editTask)="onTaskEdit($event)"
                    (deleteTask)="onTaskDelete($event)"
                    (itemDragStart)="onTaskDragStart($event.event, 'departure', i)"
                    (itemDragOver)="onTaskDragOver($event.event, 'departure', i)"
                    (itemDragLeave)="onTaskDragLeave($event.event, 'departure', i)"
                    (itemDrop)="onTaskDrop($event.event, 'departure', i)"
                    (itemDragEnd)="onTaskDragEnd()"
                  />
                } @empty {
                  <div class="empty-tasks">No departure tasks added.</div>
                }
              </div>
            }
          </div>
        </div>
      }

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
      transition: all 0.2s ease;
    }
    .stop-card.is-collapsed {
      padding: 16px 20px;
    }
    .stop-card.is-collapsed .stop-header {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .stop-card.is-dragging {
      opacity: 0.5;
      background: #f8fafc;
      border: 2px dashed #3b82f6;
    }
    .stop-card.is-drag-over {
      border-top: 3px solid #2563eb;
      background: #f0fdf4;
      box-shadow: 0 -4px 6px rgba(37, 99, 235, 0.15);
    }
    .stop-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 14px;
    }
    .stop-title-area {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .stop-drag-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 6px;
      cursor: grab;
      user-select: none;
      color: #94a3b8;
      border-radius: 4px;
      transition: color 0.15s ease, background-color 0.15s ease;
    }
    .stop-drag-handle:hover {
      color: #334155;
      background-color: #f1f5f9;
    }
    .stop-drag-handle:active {
      cursor: grabbing;
    }
    .stop-toggle-btn {
      background: none;
      border: none;
      padding: 4px 6px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .stop-toggle-btn:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }
    .stop-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-edit-stop, .btn-clone-stop {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #334155;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
    }
    .btn-edit-stop:hover, .btn-clone-stop:hover {
      background: #e2e8f0;
      border-color: #94a3b8;
      color: #0f172a;
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
    }
    .stop-name {
      margin: 0;
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
    .full-width {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }
    .hookup-badges {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .hookup-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 4px;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .codes-badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 0.825rem;
      font-family: monospace, ui-monospace, sans-serif;
      font-weight: 600;
      border-radius: 4px;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .tag-chips-list {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .feature-chip {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
    }
    .amenity-chip {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .service-chip {
      background: #f5f3ff;
      color: #6d28d9;
      border: 1px solid #ddd6fe;
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
  private tripService = inject(TripService);

  @Input({ required: true }) stop!: Stop;
  @Input() index: number = 0;
  @Input() isDragging: boolean = false;
  @Input() isDragOver: boolean = false;

  @Output() deleteStop = new EventEmitter<number>();
  @Output() cloneStop = new EventEmitter<Stop>();
  @Output() editStop = new EventEmitter<Stop>();
  @Output() addArrivalTask = new EventEmitter<{ stopId: number; description: string }>();
  @Output() addDepartureTask = new EventEmitter<{ stopId: number; description: string }>();
  @Output() taskStatusChange = new EventEmitter<{ task: Task; newStatus: TaskStatus }>();
  @Output() taskEdit = new EventEmitter<Task>();
  @Output() taskDelete = new EventEmitter<Task>();
  @Output() taskReorder = new EventEmitter<{ stopId: number; listType: string; tasks: Task[] }>();
  @Output() stopDragStart = new EventEmitter<{ event: DragEvent; index: number }>();
  @Output() stopDragOver = new EventEmitter<{ event: DragEvent; index: number }>();
  @Output() stopDragLeave = new EventEmitter<{ event: DragEvent; index: number }>();
  @Output() stopDrop = new EventEmitter<{ event: DragEvent; index: number }>();
  @Output() stopDragEnd = new EventEmitter<void>();

  showArrivalModal = false;
  showDepartureModal = false;

  draggedState: { listType: string; index: number } | null = null;
  dragOverState: { listType: string; index: number } | null = null;

  isCollapsed = signal<boolean>(false);
  isArrivalCollapsed = signal<boolean>(true);
  isDepartureCollapsed = signal<boolean>(true);

  toggleCollapse(): void {
    this.isCollapsed.update((v) => !v);
  }

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

  onStopDragStart(event: DragEvent): void {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `${this.index}`);
    }
    this.stopDragStart.emit({ event, index: this.index });
  }

  onStopDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.stopDragOver.emit({ event, index: this.index });
  }

  onStopDragLeave(event: DragEvent): void {
    this.stopDragLeave.emit({ event, index: this.index });
  }

  onStopDrop(event: DragEvent): void {
    event.preventDefault();
    this.stopDrop.emit({ event, index: this.index });
  }

  onStopDragEnd(): void {
    this.stopDragEnd.emit();
  }

  onEditStop(): void {
    this.editStop.emit(this.stop);
  }

  onCloneStop(): void {
    this.cloneStop.emit(this.stop);
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

  onTaskEdit(task: Task): void {
    this.taskEdit.emit(task);
  }

  onTaskDragStart(event: DragEvent, listType: string, index: number): void {
    this.draggedState = { listType, index };
    this.dragOverState = null;
  }

  onTaskDragOver(event: DragEvent, listType: string, index: number): void {
    if (this.draggedState && this.draggedState.listType === listType) {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      this.dragOverState = { listType, index };
    }
  }

  onTaskDragLeave(event: DragEvent, listType: string, index: number): void {
    if (this.dragOverState && this.dragOverState.listType === listType && this.dragOverState.index === index) {
      this.dragOverState = null;
    }
  }

  onTaskDrop(event: DragEvent, listType: string, targetIndex: number): void {
    event.preventDefault();
    if (!this.draggedState || this.draggedState.listType !== listType) {
      this.draggedState = null;
      this.dragOverState = null;
      return;
    }

    const sourceIndex = this.draggedState.index;
    this.draggedState = null;
    this.dragOverState = null;

    if (sourceIndex === targetIndex) {
      return;
    }

    const tasks = listType === 'arrival' ? [...this.stop.arrivalTasks] : [...this.stop.departureTasks];
    if (sourceIndex < 0 || sourceIndex >= tasks.length || targetIndex < 0 || targetIndex >= tasks.length) {
      return;
    }

    const [movedTask] = tasks.splice(sourceIndex, 1);
    tasks.splice(targetIndex, 0, movedTask);
    tasks.forEach((t, i) => t.orderIndex = i);

    if (listType === 'arrival') {
      this.stop.arrivalTasks = tasks;
    } else {
      this.stop.departureTasks = tasks;
    }

    const taskIds = tasks.map((t) => t.id);
    this.tripService.reorderTasks(taskIds).subscribe({
      next: () => {
        this.taskReorder.emit({ stopId: this.stop.id, listType, tasks });
      },
      error: (err) => {
        console.error('Failed to persist stop task reorder', err);
      }
    });
  }

  onTaskDragEnd(): void {
    this.draggedState = null;
    this.dragOverState = null;
  }

  onTaskDelete(task: Task): void {
    this.taskDelete.emit(task);
  }

  formatTime (timeStr?: string): string {
    if(!timeStr) return '';
    const parts = timeStr.split(':');
    if(parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if(isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="task-item"
      [class.completed]="task.status === TaskStatus.COMPLETED"
      [class.is-dragging]="isDragging"
      [class.is-drag-over]="isDragOver"
      draggable="true"
      (dragstart)="onDragStart($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (dragend)="onDragEnd($event)"
    >
      <div class="drag-handle" title="Drag to reorder" aria-label="Drag to reorder">
        <span class="handle-icon" aria-hidden="true">&#x283F;</span>
      </div>
      <label class="task-checkbox-label">
        <input
          type="checkbox"
          [checked]="task.status === TaskStatus.COMPLETED"
          (change)="onToggle()"
          class="task-checkbox"
        />
        <span class="task-text">{{ task.description }}</span>
      </label>
      <button type="button" class="delete-btn" (click)="onDelete()" title="Delete task">&times;</button>
    </div>
  `,
  styles: [`
    .task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      margin-bottom: 6px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      transition: all 0.2s ease;
      cursor: default;
    }
    .task-item:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    .task-item.is-dragging {
      opacity: 0.45;
      background: #eff6ff;
      border: 1px dashed #3b82f6;
    }
    .task-item.is-drag-over {
      border-top: 2px solid #2563eb;
      background: #f0fdf4;
      box-shadow: 0 -2px 4px rgba(37, 99, 235, 0.15);
    }
    .drag-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      padding: 2px 4px;
      cursor: grab;
      user-select: none;
      color: #94a3b8;
      border-radius: 4px;
      transition: color 0.15s ease, background 0.15s ease;
    }
    .drag-handle:hover {
      color: #334155;
      background: #e2e8f0;
    }
    .drag-handle:active {
      cursor: grabbing;
    }
    .handle-icon {
      font-size: 1.15rem;
      line-height: 1;
      letter-spacing: -1px;
    }
    .task-checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      flex: 1;
      user-select: none;
    }
    .task-checkbox {
      margin-right: 10px;
      cursor: pointer;
      width: 16px;
      height: 16px;
      accent-color: #2563eb;
    }
    .task-text {
      font-size: 0.95rem;
      color: #1e293b;
      word-break: break-word;
    }
    .task-item.completed .task-text {
      text-decoration: line-through;
      color: #94a3b8;
    }
    .delete-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      opacity: 0.5;
      transition: opacity 0.2s, color 0.2s;
    }
    .task-item:hover .delete-btn {
      opacity: 1;
    }
    .delete-btn:hover {
      color: #ef4444;
      background: #fee2e2;
    }
  `]
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Input() index = 0;
  @Input() isDragging = false;
  @Input() isDragOver = false;

  @Output() statusChange = new EventEmitter<{ task: Task; newStatus: TaskStatus }>();
  @Output() deleteTask = new EventEmitter<Task>();
  @Output() itemDragStart = new EventEmitter<{ event: DragEvent; task: Task; index: number }>();
  @Output() itemDragOver = new EventEmitter<{ event: DragEvent; task: Task; index: number }>();
  @Output() itemDragLeave = new EventEmitter<{ event: DragEvent; task: Task; index: number }>();
  @Output() itemDrop = new EventEmitter<{ event: DragEvent; task: Task; index: number }>();
  @Output() itemDragEnd = new EventEmitter<{ event: DragEvent; task: Task; index: number }>();

  TaskStatus = TaskStatus;

  onToggle(): void {
    const newStatus =
      this.task.status === TaskStatus.COMPLETED
        ? TaskStatus.INCOMPLETE
        : TaskStatus.COMPLETED;
    this.statusChange.emit({ task: this.task, newStatus });
  }

  onDelete(): void {
    this.deleteTask.emit(this.task);
  }

  onDragStart(event: DragEvent): void {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(this.index));
    }
    this.itemDragStart.emit({ event, task: this.task, index: this.index });
  }

  onDragOver(event: DragEvent): void {
    this.itemDragOver.emit({ event, task: this.task, index: this.index });
  }

  onDragLeave(event: DragEvent): void {
    this.itemDragLeave.emit({ event, task: this.task, index: this.index });
  }

  onDrop(event: DragEvent): void {
    this.itemDrop.emit({ event, task: this.task, index: this.index });
  }

  onDragEnd(event: DragEvent): void {
    this.itemDragEnd.emit({ event, task: this.task, index: this.index });
  }
}

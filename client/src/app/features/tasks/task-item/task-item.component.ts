import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-item" [class.completed]="task.status === TaskStatus.COMPLETED">
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
    }
    .task-item:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
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
  @Output() statusChange = new EventEmitter<{ task: Task; newStatus: TaskStatus }>();
  @Output() deleteTask = new EventEmitter<Task>();

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
}

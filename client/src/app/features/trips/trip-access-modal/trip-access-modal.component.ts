import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserSummary } from '../../../models/user.model';
import { TripService } from '../../../services/trip.service';

@Component({
  selector: 'app-trip-access-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Manage Trip Access</h3>
          <button type="button" class="close-btn" (click)="onClose()" aria-label="Close modal">&times;</button>
        </div>

        <div class="modal-body">
          <form class="add-user-form" (ngSubmit)="onAddUser()">
            <label for="collabUsername">Add Collaborator</label>
            <div class="input-with-button">
              <input
                id="collabUsername"
                type="text"
                name="username"
                [(ngModel)]="newUsername"
                list="registeredUsersList"
                placeholder="Enter username to share..."
                required
                autofocus
                class="form-input"
              />
              <datalist id="registeredUsersList">
                <option *ngFor="let u of availableSuggestions" [value]="u.username">
                  {{ u.displayName ? u.displayName + ' (@' + u.username + ')' : u.username }}
                </option>
              </datalist>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!newUsername.trim()"
              >
                Add
              </button>
            </div>
          </form>

          <div class="collaborators-section">
            <h4>Current Collaborators ({{ collaborators.length }})</h4>
            <div class="collaborators-list">
              <div *ngFor="let user of collaborators" class="collaborator-item">
                <div class="user-info">
                  <div class="user-avatar">{{ getUserInitial(user) }}</div>
                  <div class="user-details">
                    <span class="user-name">{{ user.displayName || user.username }}</span>
                    <span class="user-handle">&#64;{{ user.username }}</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn-remove"
                  (click)="onRemoveUser(user)"
                  [disabled]="collaborators.length <= 1"
                  [title]="collaborators.length <= 1 ? 'Cannot remove the only collaborator' : 'Remove collaborator'"
                  aria-label="Remove collaborator"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" (click)="onClose()">Done</button>
        </div>
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
      max-width: 520px;
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
    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .add-user-form label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #334155;
      margin-bottom: 6px;
    }
    .input-with-button {
      display: flex;
      gap: 8px;
    }
    .form-input {
      flex: 1;
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
    .collaborators-section h4 {
      margin: 0 0 12px 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #475569;
    }
    .collaborators-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 220px;
      overflow-y: auto;
    }
    .collaborator-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #2563eb;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
    }
    .user-details {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: #1e293b;
    }
    .user-handle {
      font-size: 0.75rem;
      color: #64748b;
    }
    .btn-remove {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .btn-remove:hover:not(:disabled) {
      color: #ef4444;
      background: #fee2e2;
    }
    .btn-remove:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
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
export class TripAccessModalComponent implements OnInit {
  private tripService = inject(TripService);

  @Input() collaborators: UserSummary[] = [];
  @Output() userAdded = new EventEmitter<string>();
  @Output() userRemoved = new EventEmitter<string>();
  @Output() modalClosed = new EventEmitter<void>();

  newUsername = '';
  allUsers: UserSummary[] = [];

  ngOnInit(): void {
    this.tripService.getUsers().subscribe({
      next: (users) => {
        this.allUsers = users || [];
      },
      error: () => {
        this.allUsers = [];
      }
    });
  }

  get availableSuggestions(): UserSummary[] {
    const existing = new Set((this.collaborators || []).map(c => c.username.toLowerCase()));
    return this.allUsers.filter(u => !existing.has(u.username.toLowerCase()));
  }

  getUserInitial(user: UserSummary): string {
    if (user.displayName && user.displayName.trim()) {
      return user.displayName.trim().charAt(0);
    }
    if (user.username && user.username.trim()) {
      return user.username.trim().charAt(0);
    }
    return '?';
  }

  onAddUser(): void {
    if (this.newUsername.trim()) {
      this.userAdded.emit(this.newUsername.trim());
      this.newUsername = '';
    }
  }

  onRemoveUser(user: UserSummary): void {
    if (this.collaborators.length > 1) {
      this.userRemoved.emit(user.username);
    }
  }

  onClose(): void {
    this.modalClosed.emit();
  }
}

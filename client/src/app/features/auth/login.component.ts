import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="brand-header">
          <div class="brand-logo">✈️</div>
          <h1>TripCheck</h1>
          <p class="subtitle">Fast, Passwordless Trip Planning & Checklists</p>
        </div>

        <div class="auth-tabs">
          <button
            type="button"
            class="tab-btn"
            [class.active]="isLoginMode()"
            (click)="setMode(true)"
          >
            Sign In with Passkey
          </button>
          <button
            type="button"
            class="tab-btn"
            [class.active]="!isLoginMode()"
            (click)="setMode(false)"
          >
            Register Passkey
          </button>
        </div>

        @if (errorMessage()) {
          <div class="error-alert">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="username">Username / Email</label>
            <input
              id="username"
              type="text"
              name="username"
              [(ngModel)]="username"
              placeholder="e.g. explorer@tripcheck.com"
              required
              autocomplete="username webauthn"
              class="form-input"
            />
          </div>

          @if (!isLoginMode()) {
            <div class="form-group">
              <label for="displayName">Display Name (Optional)</label>
              <input
                id="displayName"
                type="text"
                name="displayName"
                [(ngModel)]="displayName"
                placeholder="e.g. Alex Smith"
                class="form-input"
              />
            </div>
          }

          <button
            type="submit"
            class="btn-submit"
            [disabled]="authService.isLoading() || !username.trim()"
          >
            @if (authService.isLoading()) {
              <span>Verifying Passkey...</span>
            } @else {
              <span>{{ isLoginMode() ? 'Sign In with Passkey 🔑' : 'Create Account & Passkey 🔑' }}</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p class="secure-badge">🔒 Powered by WebAuthn & FIDO2 Cryptographic Passkeys</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 20px;
      box-sizing: border-box;
    }
    .auth-card {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 440px;
      padding: 36px 32px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      box-sizing: border-box;
    }
    .brand-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .brand-logo {
      font-size: 2.5rem;
      margin-bottom: 8px;
    }
    .brand-header h1 {
      margin: 0;
      font-size: 1.85rem;
      font-weight: 700;
      color: #0f172a;
    }
    .subtitle {
      margin: 6px 0 0 0;
      font-size: 0.9rem;
      color: #64748b;
    }
    .auth-tabs {
      display: flex;
      background: #f1f5f9;
      border-radius: 8px;
      padding: 4px;
      margin-bottom: 24px;
    }
    .tab-btn {
      flex: 1;
      padding: 8px 12px;
      border: none;
      background: none;
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
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
    .btn-submit {
      width: 100%;
      padding: 12px;
      background: #2563eb;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 6px;
    }
    .btn-submit:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }
    .secure-badge {
      margin: 0;
      font-size: 0.78rem;
      color: #64748b;
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isLoginMode = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  username: string = '';
  displayName: string = '';

  setMode(isLogin: boolean): void {
    this.isLoginMode.set(isLogin);
    this.errorMessage.set(null);
  }

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    const user = this.username.trim();
    if (!user) return;

    try {
      if (this.isLoginMode()) {
        await this.authService.loginPasskey(user);
      } else {
        await this.authService.registerPasskey(user, this.displayName.trim() || undefined);
      }
    } catch (err: any) {
      this.errorMessage.set(
        err?.error?.message ||
        err?.message ||
        'Authentication failed. Please verify your passkey device.'
      );
    }
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as webauthnJson from '@github/webauthn-json';

export interface UserInfo {
  authenticated: boolean;
  username?: string;
  authorities?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<UserInfo | null>(null);
  isLoading = signal<boolean>(false);

  constructor() {
    this.checkAuthStatus().subscribe();
  }

  isAuthenticated(): boolean {
    return !!this.currentUser()?.authenticated;
  }

  checkAuthStatus(): Observable<UserInfo> {
    return this.http.get<UserInfo>('api/auth/me', { withCredentials: true }).pipe(
      tap((user) => {
        this.currentUser.set(user);
      }),
      catchError(() => {
        const unauth: UserInfo = { authenticated: false };
        this.currentUser.set(unauth);
        return of(unauth);
      })
    );
  }

  async registerPasskey(username: string, displayName?: string): Promise<any> {
    this.isLoading.set(true);
    try {
      // 1. Get creation options from server
      const creationOptionsResponse = await firstValueFrom(
        this.http.post<any>(
          'api/auth/webauthn/register-request',
          { username, displayName: displayName || username },
          { withCredentials: true }
        )
      );

      // Convert options if needed for @github/webauthn-json
      const requestOptions = creationOptionsResponse.publicKey || creationOptionsResponse;

      // 2. Browser WebAuthn prompt
      const credential = await webauthnJson.create({ publicKey: requestOptions });

      // 3. Finish registration on server
      const finishResponse = await firstValueFrom(
        this.http.post<any>(
          'api/auth/webauthn/register-finish',
          {
            username,
            credential
          },
          { withCredentials: true }
        )
      );

      await firstValueFrom(this.checkAuthStatus());
      this.router.navigate(['/trips']);
      return finishResponse;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginPasskey(username: string): Promise<any> {
    this.isLoading.set(true);
    try {
      // 1. Get assertion options from server
      const assertionOptionsResponse = await firstValueFrom(
        this.http.post<any>(
          'api/auth/webauthn/login-request',
          { username },
          { withCredentials: true }
        )
      );

      const requestOptions = assertionOptionsResponse.publicKey || assertionOptionsResponse;

      // 2. Browser WebAuthn assertion
      const credential = await webauthnJson.get({ publicKey: requestOptions });

      // 3. Finish login on server
      const finishResponse = await firstValueFrom(
        this.http.post<any>(
          'api/auth/webauthn/login-finish',
          {
            username,
            credential
          },
          { withCredentials: true }
        )
      );

      await firstValueFrom(this.checkAuthStatus());
      this.router.navigate(['/trips']);
      return finishResponse;
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post('api/auth/logout', {}, { withCredentials: true }));
    } catch {
      // ignore
    }
    this.currentUser.set({ authenticated: false });
    this.router.navigate(['/login']);
  }
}

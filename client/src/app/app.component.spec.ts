import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService, UserInfo } from './core/auth/auth.service';
import { signal } from '@angular/core';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockAuthService: {
    currentUser: ReturnType<typeof signal<UserInfo | null>>;
    isAuthenticated: jasmine.Spy;
    logout: jasmine.Spy;
  };

  beforeEach(async () => {
    mockAuthService = {
      currentUser: signal<UserInfo | null>(null),
      isAuthenticated: jasmine.createSpy('isAuthenticated').and.callFake(() => {
        return !!mockAuthService.currentUser()?.authenticated;
      }),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the display_name in the header when authenticated', () => {
    mockAuthService.currentUser.set({
      authenticated: true,
      username: 'alice',
      displayName: 'Alice Traveler'
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.username-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('Alice Traveler');
    expect(badge?.textContent).not.toContain('alice');
  });

  it('should fallback to username if display_name is not provided', () => {
    mockAuthService.currentUser.set({
      authenticated: true,
      username: 'bob'
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.username-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('bob');
  });

  it('should call logout when clicking sign out', () => {
    mockAuthService.currentUser.set({
      authenticated: true,
      username: 'alice',
      displayName: 'Alice Traveler'
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const logoutBtn = compiled.querySelector('.btn-logout') as HTMLButtonElement;
    expect(logoutBtn).toBeTruthy();
    logoutBtn.click();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});

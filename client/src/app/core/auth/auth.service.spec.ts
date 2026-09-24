import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);

    // handle the constructor initial call
    const initialReq = httpTesting.expectOne('/api/auth/me');
    initialReq.flush({ authenticated: false });
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should check auth status and update signals', () => {
    service.checkAuthStatus().subscribe((user) => {
      expect(user.authenticated).toBe(true);
      expect(user.username).toBe('alice');
    });

    const req = httpTesting.expectOne('/api/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush({ authenticated: true, username: 'alice' });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.username).toBe('alice');
  });
});

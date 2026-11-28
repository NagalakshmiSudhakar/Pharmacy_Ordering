import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Registration request
export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

// Login response from backend
export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  token: string;
  expiration: string;
}

export interface UserSession {
  userId: string;
  fullName: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5271/api/auth';

  private _currentUser = signal<UserSession | null>(this.readStoredUser());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null && this.hasValidToken());

  constructor(private http: HttpClient) {}

  // ─── Login ───────────────────────────────────────────────────────────────────
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        // Store all session data BEFORE updating the signal
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('role', response.role);
        sessionStorage.setItem('token_expiration', response.expiration);

        const userSession: UserSession = {
          userId: response.userId,
          fullName: response.fullName,
          email: response.email,
          role: response.role
        };

        sessionStorage.setItem('user', JSON.stringify(userSession));
        this._currentUser.set(userSession);
      })
    );
  }

  // ─── Register ────────────────────────────────────────────────────────────────
  register(data: RegisterRequest): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/register`, data);
  }

  // ─── Token helpers ───────────────────────────────────────────────────────────
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getRole(): string | null {
    return sessionStorage.getItem('role');
  }

  getUser(): UserSession | null {
    return this._currentUser();
  }

  /**
   * Returns true only if the token is definitely expired.
   * Uses JWT exp claim (unix timestamp, always UTC — no timezone issues).
   * Returns FALSE (not expired) if parsing fails — fail open so a valid
   * token is never wrongly rejected due to a parse glitch.
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    // Primary: decode JWT exp claim (unix seconds, UTC — no timezone ambiguity)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(b64));
        if (typeof payload.exp === 'number') {
          return Date.now() >= payload.exp * 1000;
        }
      }
    } catch {
      // If we cannot decode the JWT, check the stored expiration string instead
    }

    // Fallback: stored expiration — append 'Z' to force UTC interpretation
    const expiration = sessionStorage.getItem('token_expiration');
    if (expiration) {
      const utcString = expiration.endsWith('Z') ? expiration : expiration + 'Z';
      const expiresAt = Date.parse(utcString);
      if (!Number.isNaN(expiresAt)) {
        return Date.now() >= expiresAt;
      }
    }

    // Cannot determine — assume valid (fail open)
    return false;
  }

  private hasValidToken(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  /**
   * Returns true if the user has a valid, non-expired token.
   * IMPORTANT: does NOT call logout() — guards must never clear session as a
   * side-effect of a simple boolean check.
   */
  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && this.getRole()?.toLowerCase() === 'admin';
  }

  isCustomer(): boolean {
    return this.isLoggedIn() && this.getRole()?.toLowerCase() === 'customer';
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────
  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('token_expiration');
    sessionStorage.removeItem('user');
    this._currentUser.set(null);
  }

  // ─── Restore session on page refresh ─────────────────────────────────────────
  private readStoredUser(): UserSession | null {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return null;
    }

    // Silently discard expired sessions on startup
    if (this.isTokenExpiredForToken(token)) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('token_expiration');
      sessionStorage.removeItem('user');
      return null;
    }

    const rawUser = sessionStorage.getItem('user');
    if (!rawUser) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawUser) as Partial<UserSession>;
      if (!parsed.userId) {
        return null;
      }
      return {
        userId: parsed.userId,
        fullName: parsed.fullName || 'User',
        email: parsed.email || '',
        role: parsed.role || sessionStorage.getItem('role') || ''
      };
    } catch {
      return null;
    }
  }

  /**
   * Token-scoped expiry check used only during startup (avoids calling
   * getToken() which reads from sessionStorage at a time when it may be
   * in a partially-cleared state).
   */
  private isTokenExpiredForToken(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(b64));
        if (typeof payload.exp === 'number') {
          return Date.now() >= payload.exp * 1000;
        }
      }
    } catch {
      // Cannot parse — treat as valid so a fresh token is never discarded
      return false;
    }

    const expiration = sessionStorage.getItem('token_expiration');
    if (expiration) {
      const utcString = expiration.endsWith('Z') ? expiration : expiration + 'Z';
      const expiresAt = Date.parse(utcString);
      if (!Number.isNaN(expiresAt)) {
        return Date.now() >= expiresAt;
      }
    }

    return false;
  }
}

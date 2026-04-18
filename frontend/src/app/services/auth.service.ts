import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { ApiUser, LoginResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  private readonly tokenKey = 'studysync_token';
  private readonly userKey = 'studysync_user';

  private readonly currentUserSubject = new BehaviorSubject<ApiUser | null>(this.getStoredUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  get currentUserValue(): ApiUser | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, { username, password }).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout/`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
      tap(() => this.router.navigate(['/login']))
    );
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private getStoredUser(): ApiUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as ApiUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }
}

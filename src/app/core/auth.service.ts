import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './api.config';

const TOKEN_KEY = 'xc-portfolio-admin-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly isAuthenticated = computed(() => Boolean(this.token()));

  getToken(): string | null {
    return this.token();
  }

  async login(email: string, password: string): Promise<boolean> {
    const response = await firstValueFrom(this.http.post<{ token: string }>(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    }));

    localStorage.setItem(TOKEN_KEY, response.token);
    this.token.set(response.token);
    return true;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }
}

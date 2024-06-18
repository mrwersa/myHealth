import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/auth-response.model';
import { UserProfile, UserProfileResponse } from '../models/user-profile.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken: string | null = null;
  private authState = new BehaviorSubject<boolean>(this.checkInitialAuth());

  constructor(private http: HttpClient, private router: Router) { }

  private checkInitialAuth(): boolean {
    const token = localStorage.getItem('fitbit_access_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const isExpired = decodedToken.exp * 1000 < Date.now();
        if (!isExpired) {
          this.accessToken = token;
          return true;
        }
      } catch (e) {
        console.error('Invalid token', e);
      }
    }
    return false;
  }

  isLoggedIn(): Observable<boolean> {
    return this.authState.asObservable();
  }

  login(): void {
    const authUrl = `${environment.fitbitAuthorizationUri}?response_type=code&client_id=${environment.fitbitClientId}&redirect_uri=${environment.fitbitRedirectUri}&scope=${environment.fitbitScopes}&expires_in=604800`;
    window.location.href = authUrl;
  }

  logout(): void {
    this.accessToken = null;
    localStorage.removeItem('fitbit_access_token');
    localStorage.removeItem('user_profile');
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    const token = this.accessToken || localStorage.getItem('fitbit_access_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const isExpired = decodedToken.exp * 1000 < Date.now();
        if (!isExpired) {
          this.accessToken = token;
          return token;
        } else {
          this.logout();
          return null;
        }
      } catch (e) {
        console.error('Invalid token', e);
        this.logout();
        return null;
      }
    }
    return null;
  }

  handleAuthCallback(code: string): Observable<AuthResponse> {
    if (!code) {
      return throwError(() => new Error('Authorization code is missing'));
    }

    const tokenUrl = environment.fitbitTokenUri;
    const body = new URLSearchParams();
    body.set('client_id', environment.fitbitClientId);
    body.set('grant_type', 'authorization_code');
    body.set('redirect_uri', environment.fitbitRedirectUri);
    body.set('code', code);

    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa(`${environment.fitbitClientId}:${environment.fitbitClientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<AuthResponse>(tokenUrl, body.toString(), { headers }).pipe(
      switchMap(response => this.setAccessToken(response.access_token).pipe(map(() => response))),
      catchError(error => {
        console.error('Error during token exchange:', error);
        return throwError(() => new Error('Failed to handle authentication callback'));
      }),
    );
  }

  private setAccessToken(token: string): Observable<void> {
    this.accessToken = token;
    localStorage.setItem('fitbit_access_token', token);
    return this.fetchProfile().pipe(
      map(profile => {
        localStorage.setItem('user_profile', JSON.stringify(profile));
        this.authState.next(true);
      }),
      catchError(error => {
        console.error('Error fetching profile:', error);
        return throwError(() => new Error('Failed to fetch profile'));
      })
    );
  }

  private fetchProfile(): Observable<UserProfile> {
    const token = this.getAccessToken();
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<UserProfileResponse>(`${environment.fitbitApiBaseUrl}/profile.json`, { headers }).pipe(
      map(response => response.user),
    );
  }

  getUserProfile(cached: boolean = true): Observable<UserProfile> {
    if (cached) {
      const profile = localStorage.getItem('user_profile');
      if (profile) {
        return of(JSON.parse(profile) as UserProfile);
      }
    }

    return this.fetchProfile().pipe(
      map(profile => {
        localStorage.setItem('user_profile', JSON.stringify(profile));
        return profile;
      }),
    );
  }
}

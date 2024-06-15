import { Injectable } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private oauthService: OAuthService) {
    this.configure();
  }

  private configure() {
    const authConfig: AuthConfig = {
      issuer: 'https://www.fitbit.com/oauth2/authorize',
      redirectUri: window.location.origin,
      clientId: 'YOUR_FITBIT_CLIENT_ID',
      responseType: 'token',
      scope: 'profile activity',
      showDebugInformation: true,
    };
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  public login() {
    this.oauthService.initImplicitFlow();
  }

  public logout() {
    this.oauthService.logOut();
  }

  public get accessToken(): string {
    return this.oauthService.getAccessToken();
  }

  public get isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }
}

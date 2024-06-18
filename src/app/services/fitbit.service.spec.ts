import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FitbitService {
  private tokenUri = environment.fitbitTokenUri;
  private clientId = environment.fitbitClientId;
  private clientSecret = environment.fitbitClientSecret;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    // Assuming you have the access token logic handled somewhere
    const accessToken = 'YOUR_ACCESS_TOKEN';
    return this.http.get('https://api.fitbit.com/1/user/-/profile.json', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  }
}

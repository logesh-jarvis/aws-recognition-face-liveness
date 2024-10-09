import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly apiUrl = 'http://localhost:3000'; // Replace with your API URL
  private readonly rekognApi = 'http://localhost:3200';

  constructor(private readonly http: HttpClient) { }

  public getToken(): Observable<any> {
    const token = JSON.parse(localStorage.getItem('token') ?? '{}');
    return this.http.get(`${this.apiUrl}/api/getToken`, { responseType: 'text', headers: { 'Authorization': `${token.token}` } });
  }

  public createLivenessSession(): Observable<any> {
    return this.http.get(`${this.rekognApi}/create-session`);
  }

  public getLivenessSessionResults(sessionId: string): Observable<any> {
    return this.http.post(`${this.rekognApi}/get-session-results`, { sessionid: sessionId });
  }
}
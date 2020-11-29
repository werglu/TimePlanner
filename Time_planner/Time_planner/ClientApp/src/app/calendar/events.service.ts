import { Injectable, Component } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Events } from './events';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventsService {

  constructor(public http: HttpClient) {
  }

  getAllEvents(userId: string): Observable<Events[]> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.get<Events[]>(baseUrl + 'api/Events/' + userId);
  }

  getEvent(userId: string, id: number): Observable<Events> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.get<Events>(baseUrl + 'api/Events/' + userId + '/' + id.toString());
  }

  deleteEvent(id: number): Observable<Events> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.delete<Events>(baseUrl + 'api/Events/' + id.toString());
  }

  public editEvent(id: number, event: Events): Observable<Events> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.put<Events>(baseUrl + 'api/Events/' + id.toString(), event);
  }

  public addEvent(event: Events): Observable<Events> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.post<Events>(baseUrl + 'api/Events/', event);
  }
}

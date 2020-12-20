import { Injectable, Component } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Events } from './events';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  baseUrl: string;

  constructor(public http: HttpClient) {
    this.baseUrl = environment.apiBaseUrl;
  }

  getAllEvents(userId: string): Observable<Events[]> {
    return this.http.get<Events[]>(this.baseUrl + 'api/Events/user?id=' + userId);
  }

  getEvent(id: number): Observable<Events> {
    return this.http.get<Events>(this.baseUrl + 'api/Events/event?id=' + id.toString());
  }

  deleteEvent(id: number): Observable<Events> {
    return this.http.delete<Events>(this.baseUrl + 'api/Events/' + id.toString());
  }

  public editEvent(id: number, event: Events): Observable<Events> {
    return this.http.put<Events>(this.baseUrl + 'api/Events/' + id.toString(), event);
  }

  public addEvent(event: Events, friendIds: string[]): Observable<Events> {
    return this.http.post<Events>(this.baseUrl + 'api/Events/', {
      event: event,
      friendIds: friendIds
    });
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { UsersEvents } from './events';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserEventsService {

  constructor(public http: HttpClient) {
  }

  getUserEvents(userId: string, eventId: number): Observable<UsersEvents> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.get<UsersEvents>(baseUrl + 'api/UsersEvents/' + userId + '/' + eventId.toString());
  }

  editUserEvent(id: number, userEvent: UsersEvents): Observable<UsersEvents> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.put<UsersEvents>(baseUrl + 'api/UsersEvents/' + id.toString(), userEvent);
  }

  addUserEvent(userEvent: UsersEvents): Observable<UsersEvents> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.post<UsersEvents>(baseUrl + 'api/UsersEvents/', userEvent);
  }

}

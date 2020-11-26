import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from './notification';

@Injectable({
  providedIn: 'root',
})

export class NotificationsService {

  constructor(public http: HttpClient) {
  }

  getNotifications(userId: string): Observable<Notification[]> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.get<Notification[]>(baseUrl + 'api/Notifications/' + userId);
  }

  editNotification(id: number, notification: Notification): Observable<Notification> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.put<Notification>(baseUrl + 'api/Notifications/' + id.toString(), notification);
  }

  addNotification(notification: Notification): Observable<Notification> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.post<Notification>(baseUrl + 'api/Notifications/add', notification);
  }
}

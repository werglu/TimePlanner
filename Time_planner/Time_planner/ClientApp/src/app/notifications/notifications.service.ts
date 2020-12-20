import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from './notification';

@Injectable({
  providedIn: 'root',
})

export class NotificationsService {
  baseUrl: string;

  constructor(public http: HttpClient) {
    this.baseUrl = environment.apiBaseUrl;
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl + 'api/Notifications/');
  }

  dismissNotification(id: number): Observable<Notification> {
    return this.http.post<Notification>(this.baseUrl + 'api/Notifications/dismiss?id=' + id.toString(), {});
  }

  acceptNotification(id: number): Observable<Notification> {
    return this.http.post<Notification>(this.baseUrl + 'api/Notifications/accept?id=' + id.toString(), {});
  }

  rejectNotification(id: number): Observable<Notification> {
    return this.http.post<Notification>(this.baseUrl + 'api/Notifications/reject?id=' + id.toString(), {});
  }

  sendInviteNotification(eventId: number, receiverId: string): Observable<Notification> {
    return this.http.post<Notification>(this.baseUrl + 'api/Notifications/invite?eventId=' + eventId.toString() + '&receiverId=' + receiverId, {});
  }
}

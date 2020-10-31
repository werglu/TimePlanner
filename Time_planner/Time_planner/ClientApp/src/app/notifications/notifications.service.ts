import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class NotificationsService {

  constructor(public http: HttpClient) {
  }

  getNotificationss(): Observable<Notification[]> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.get<Notification[]>(baseUrl + 'api/Notifications');
  }

  editNotification(id: number, notification: Notification): Observable<Notification> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.put<Notification>(baseUrl + 'api/Notifications/' + id.toString(), notification);
  }

}

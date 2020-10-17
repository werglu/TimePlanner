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

  getAllEvents(): Observable<Events[]> {
    var baseUrl: string = environment.apiBaseUrl;
    var x = this.http.get<Events[]>(baseUrl + 'api/Events');
    return x;
  }
}

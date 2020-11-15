import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(public http: HttpClient) {
  }

  public putUser(id: number): Observable<any> {
    let baseUrl: string = environment.apiBaseUrl;
    return this.http.post(baseUrl + 'api/Users/' + id.toString(), {});
  }
}

interface Users {
  facebookId: number
}

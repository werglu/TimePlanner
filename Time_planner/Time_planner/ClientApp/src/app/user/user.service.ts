import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Friend } from '../shared/friend';
import { FacebookService } from 'ngx-facebook';
import { User } from './user';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(public http: HttpClient,
    private fb: FacebookService) {
  }

  public getUser(userId: string): Observable<User> {
    let baseUrl: string = environment.apiBaseUrl;
    return this.http.get<User>(baseUrl + 'api/Users/' + userId.toString());
  }

  public editUser(id: string, user: User): Observable<User> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.put<User>(baseUrl + 'api/Users/' + id, user);
  }

  public putUser(token: string): Observable<any> {
    let baseUrl: string = environment.apiBaseUrl;
    return this.http.post(baseUrl + 'api/Users/' + token, {});
  }

  public getUserFriends(): Observable<Friend[]> {
    let friends = [];
   
    this.fb.api(
      "/me/friends",
      "get",
      { "fields": "id,name,picture.type(normal)" }).then(
      response => {
        if (response && !response.error) {          
          response.data.forEach((x) => {
            friends.push({
              FacebookId: x.id,
              name: x.name,
              photoUrl: x.picture.data.url
            })
          });
        }
      });

    return of(friends);
  }
}

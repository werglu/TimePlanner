import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Friend } from '../shared/friend';

declare var FB: any;

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(public http: HttpClient) {
  }
  ngOnInit(): void {

    (window as any).fbAsyncInit = function () {
      FB.init({
        appId: '343708573552335',
        cookie: true,
        xfbml: true,
        version: 'v8.0',
      });

      FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

  }

  public putUser(id: number): Observable<any> {
    let baseUrl: string = environment.apiBaseUrl;
    return this.http.post(baseUrl + 'api/Users/' + id.toString(), {});
  }

  public getUserFriends(): Friend[] {
    let friends = [];

    FB.api(
      "/me/friends",
      'GET',
      { "fields": "id,name,picture.type(normal)" },
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

    return friends;
  }
}

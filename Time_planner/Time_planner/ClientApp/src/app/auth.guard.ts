import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import { Injectable, OnInit } from "@angular/core";

declare var FB: any;

@Injectable()
export class AuthGuard implements OnInit, CanActivate {

  ngOnInit() {
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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        sessionStorage.setItem("connected", "true");
      } else {
        sessionStorage.setItem("connected", "false");
      }
    });

    let connected = sessionStorage.getItem("connected");
    sessionStorage.removeItem("connected");

    if (connected === "true") {
      return true;
    } else {
      window.location.replace("https://localhost:5001/access-denied");
      return false;
    }
  }
}

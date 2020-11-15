import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from "@angular/router";
import { Injectable, OnInit } from "@angular/core";

declare var FB: any;

@Injectable()
export class AuthGuard implements OnInit, CanActivate {

  isConnected: boolean;

  constructor(private router: Router) {
  }

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

    FB.getLoginStatus( response => {
      if (response.status === 'connected') {
        this.isConnected = true;
      } else {
        this.isConnected = false;
      }
    });

    if (this.isConnected == true) {
      return true;
    } else {
      this.router.navigate(['/access-denied']);
      return false;
    }
  }
}

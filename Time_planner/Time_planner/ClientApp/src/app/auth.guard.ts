import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from "@angular/router";
import { Injectable, OnInit} from "@angular/core";
import { FacebookService, InitParams, LoginStatus } from 'ngx-facebook';

@Injectable()
export class AuthGuard implements OnInit, CanActivate {

  isConnected: boolean;

  constructor(private router: Router,
    private fb: FacebookService) {
  }

  ngOnInit() {
  const initParams: InitParams = {
    appId: '343708573552335',
    cookie: true,
    xfbml: true,
    version: 'v9.0',
  };

    this.fb.init(initParams);
    this.fb.getLoginStatus(true);
}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    
    return this.fb.getLoginStatus().catch((error) => {
      console.log(error);
    }).then((response: LoginStatus) => {
      if (response.status === 'connected') {
        return true;
      } else {
        this.router.navigate(['/access-denied']);
        return false;
      }
    }).catch((error) => {
      return false;
    });
  }
}

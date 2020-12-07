import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from '../notifications/notifications.service';
import { Subscription, interval } from 'rxjs';
import { UserService } from '../user/user.service';
import { FacebookService, LoginStatus, InitParams } from 'ngx-facebook';


@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit, OnDestroy {
  isExpanded = false;
  showNotificationsList = false;
  noNotifications = true;
  subscription: Subscription;
  userId: string;

  constructor(private router: Router,
    private fb: FacebookService,
    private notificationsService: NotificationsService,
    public userService: UserService) {
  }

  ngOnInit(): void {
    const initParams: InitParams = {
      appId: '343708573552335',
      cookie: true,
      xfbml: true,
      version: 'v9.0',
    };

    this.fb.init(initParams);
  
    this.fb.getLoginStatus().then(response => {
        let loginBtn = document.getElementById("loginBtn");
        let logoutBtn = document.getElementById("logoutBtn");
        let notificationsBtn = document.getElementById("notificationBtn");
        if (response.authResponse != null) {
          this.userId = response.authResponse.userID;
        }
        const source = interval(5000);
        this.subscription = source.subscribe(val => this.getNotifications());

        if (response.status === 'connected') {
          loginBtn.style.display = "none";
          logoutBtn.style.display = "block";
          notificationsBtn.style.display = "block";
        } else {
          loginBtn.style.display = "block";
          logoutBtn.style.display = "none";
          notificationsBtn.style.display = "none";
        }
      });

  }

  fbLogout() {
    this.fb.logout().then(response => {
      let loginBtn = document.getElementById("loginBtn");
      loginBtn.style.display = "block";
      let logoutBtn = document.getElementById("logoutBtn");
      logoutBtn.style.display = "none";
      let notificationsBtn = document.getElementById("notificationBtn");
      notificationsBtn.style.display = "none";

      this.router.navigate(['/logout']);
    });
  }

  fbLogin() {
    this.fb.login({
      scope: 'public_profile, email, user_friends, user_photos',
      return_scopes: true
    }).then((response: LoginStatus) => {
      if (response.authResponse) {
        let loginBtn = document.getElementById("loginBtn");
        loginBtn.style.display = "none";
        let logoutBtn = document.getElementById("logoutBtn");
        logoutBtn.style.display = "block";
        let notificationsBtn = document.getElementById("notificationBtn");
        notificationsBtn.style.display = "block";

        if (response.authResponse != null) {
          this.userId = response.authResponse.userID;
        }
        this.userService.putUser(response.authResponse.userID).subscribe(() => this.router.navigate(['/']));
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getNotifications() {

    this.notificationsService.getNotifications(this.userId).subscribe(n => {
      if (n.length == 0) {
        this.noNotifications = true;
      }
      else {
        this.noNotifications = false;
      }
    });
  }

  collapse() {
    this.isExpanded = false;
  }

  notificationsChanged(noNotifications: boolean) {
    this.noNotifications = noNotifications;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  showNotifications() {
    this.showNotificationsList = !this.showNotificationsList;
  }
}

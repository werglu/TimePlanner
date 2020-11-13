import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from '../notifications/notifications.service';
import { Subscription, interval } from 'rxjs';

declare var FB: any;

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

  constructor(private router: Router, private notificationsService: NotificationsService) {
    const source = interval(5000);
    this.subscription = source.subscribe(val => this.getNotifications());
  }

  ngOnInit(): void {

    (window as any).fbAsyncInit = function () {
      FB.init({
        appId: '343708573552335',
        cookie: true,
        xfbml: true,
        version: 'v8.0',
      });

      // log visitor activity
      // TODO: support to July 1,2022
      // https://developers.facebook.com/docs/facebook-pixel
      FB.AppEvents.logPageView();

      FB.getLoginStatus(function (response) {
        let loginBtn = document.getElementById("loginBtn");
        let logoutBtn = document.getElementById("logoutBtn");
        let notificationsBtn = document.getElementById("notificationBtn");

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
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  fbLogout() {
    FB.logout(function (response) {
      let loginBtn = document.getElementById("loginBtn");
      loginBtn.style.display = "block";
      let logoutBtn = document.getElementById("logoutBtn");
      logoutBtn.style.display = "none";
      let notificationsBtn = document.getElementById("notificationBtn");
      notificationsBtn.style.display = "none";

      window.location.replace("https://localhost:5001/access-denied");
    });
  }

  fbLogin() {
    FB.login(function (response) {
      if (response.authResponse) {
        let loginBtn = document.getElementById("loginBtn");
        loginBtn.style.display = "none";
        let logoutBtn = document.getElementById("logoutBtn");
        logoutBtn.style.display = "block";
        let notificationsBtn = document.getElementById("notificationBtn");
        notificationsBtn.style.display = "block";

        window.location.replace("https://localhost:5001/");
      }
    }, {
      scope: 'public_profile, email, user_friends, user_photos',
      return_scopes: true
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getNotifications() {
    this.notificationsService.getNotificationss().subscribe(n => {
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

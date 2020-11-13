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

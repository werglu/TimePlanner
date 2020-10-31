import { Component, OnDestroy } from '@angular/core';
import { NotificationsService } from '../notifications/notifications.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnDestroy {
  isExpanded = false;
  showNotificationsList = false;
  noNotifications = true;
  subscription: Subscription;


  constructor(private notificationsService: NotificationsService) {
    const source = interval(5000);
    this.subscription = source.subscribe(val => this.getNotifications());
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

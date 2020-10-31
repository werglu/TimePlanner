import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification';

@Component({
  selector: 'notifications-component',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})

export class NotificationsComponent implements OnInit {

  public messages: Array<string> = ['Some user invites you to join an event jdjkfghjdfhgkjkjghdfkjhgkdfhg', 'Some user accepted your request', 'Some user rejected your request'];
  public view: Observable<GridDataResult>;
  public gridData: any[] = [];
  refresh: Subject<any> = new Subject();
  notificationDetailsVisible = false;
  notificationDetails: Notification;
  @Output() onChange = new EventEmitter <boolean>();

  constructor(private notificationsService: NotificationsService) {
    this.getNotifications();
  }

  ngOnInit() {

  }

  getNotifications() {
    this.notificationsService.getNotificationss().subscribe(notifications => {
      this.gridData = [];
      notifications.forEach(n => this.gridData.push(n));
      this.checkIfThereAreAnyNotifications();
    });
  }

  dismiss(dataItem: any) {
    dataItem.isDismissed = true;
    this.notificationsService.editNotification(dataItem.id, dataItem).subscribe(() => this.getNotifications());
  }

  dismissAll() {
    this.gridData.forEach(n => this.dismiss(n));
    this.getNotifications();
  }

  threeDotsWrap(message: string): string {
    if (message.length <= 50) {
      return message;
    }
    var msg = message.substring(0, 50);
    msg = msg.concat(".");
    msg = msg.concat(".");
    msg = msg.concat(".");
    return msg;
  }

  checkIfThereAreAnyNotifications() {
    if (this.gridData.length == 0) {
      this.onChange.emit(true);
    }
    else {
      this.onChange.emit(false);
    }
  }

  closeNotificationDetailsModal() {
    this.notificationDetailsVisible = false;
  }

  showNotificationDetailsModal(dataItem: Notification) {
    this.notificationDetailsVisible = true;
    this.notificationDetails = dataItem;
  }

  emitNotification(notification: Notification) {

  }
}

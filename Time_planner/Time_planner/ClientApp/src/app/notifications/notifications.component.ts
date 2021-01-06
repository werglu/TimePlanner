import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification';
import { UserService } from '../user/user.service';
import { Friend } from '../shared/friend';

@Component({
  selector: 'notifications-component',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})

export class NotificationsComponent implements OnInit {

  public colors: Array<string> = ['#00ace6', '#00cc99', '#ff4d88'];
  public messages: Array<string> = [' invites you to join an event', ' accepted your request', ' rejected your request'];
  public view: Observable<GridDataResult>;
  public gridData: any[] = [];
  refresh: Subject<any> = new Subject();
  notificationDetailsVisible = false;
  notificationDetails: Notification;
  friends: Friend[] = [];
  @Output() onChange = new EventEmitter <boolean>();
  @Input() userId: string;

  constructor(private notificationsService: NotificationsService,
    private userService: UserService) {
    this.userService.getUserFriends().subscribe((friends) => {
      this.friends = friends;
    });
  }

  ngOnInit(): void {
    this.getNotifications()
  }

  getNotifications() {
    this.notificationsService.getNotifications().subscribe(notifications => {
      this.gridData = [];
      notifications.forEach(n => this.gridData.push(n));
      this.checkIfThereAreAnyNotifications();
    });
  }

  getFriendNameById(friendId: string): string {
    var friend = this.friends.find(f => f.FacebookId.toString() == friendId);
    if (friend == null) {
     return ""; 
    }
    return friend.name;
  }

  dismiss(dataItem: any) {
    dataItem.isDismissed = true;
    this.notificationsService.dismissNotification(dataItem.id).subscribe(() => this.getNotifications());
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
    this.closeNotificationDetailsModal();
    this.dismiss(notification);
  }
}

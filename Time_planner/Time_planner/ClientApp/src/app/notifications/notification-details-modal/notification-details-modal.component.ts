import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Notification } from '../notification';
import { Events, UsersEvents } from '../../calendar/events';
import { EventsService } from '../../calendar/events.service';
import { UserService } from '../../user/user.service';
import { Friend } from '../../shared/friend';
import { NotificationsService } from '../notifications.service';
import { UserEventsService } from '../../calendar/userEvents.service';

@Component({
  selector: 'notification-details-modal',
  templateUrl: './notification-details-modal.component.html',
  styleUrls: ['./notification-details-modal.component.css']
})

export class NotificationDetailsModalComponent implements OnInit {
  @Input() notificationDetails: Notification;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<Notification>();
  messageType: number;
  notificationEvent: Events;
  friends: Friend[] = [];

  public messages: Array<string> = [' invites you to join an event', ' accepted your request', ' rejected your request'];

  constructor(private eventsService: EventsService,
    private userService: UserService,
    private notificationService: NotificationsService,
    private userEventsService: UserEventsService) {
    this.userService.getUserFriends().subscribe((friends) => {
      this.friends = friends;
    });
  }

  ngOnInit(): void {
    this.messageType = this.notificationDetails.messageType;
    if (this.notificationDetails.eventId != null) {
      this.eventsService.getEvent(this.notificationDetails.eventId).subscribe(ne => this.notificationEvent = ne);
    }
  } 

  cancel() {
    this.onCancel.emit();
  }

  save(accepted: boolean) {
    if (accepted) {
      this.notificationService.acceptNotification(this.notificationDetails.id).subscribe(() => {
        this.onSave.emit(this.notificationDetails);
      });
    } else {
      this.notificationService.rejectNotification(this.notificationDetails.id).subscribe(() => {
        this.onSave.emit(this.notificationDetails);
      });
    }
  }

  getFriendNameById(friendId: string): string {
    var friend = this.friends.find(f => f.FacebookId.toString() == friendId);
    if (friend == null) {
      return "";
    }
    return friend.name;
  }

  getUserEvent(eventId: number, status: number): UsersEvents {
    return {
      id: 1,
      eventId: eventId,
      userId: this.notificationDetails.receiverId,
      status: status
    }
  }
}

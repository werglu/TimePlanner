import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Notification } from '../notification';
import { Events } from '../../calendar/events';
import { EventsService } from '../../calendar/events.service';

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

  public messages: Array<string> = ['Some user invites you to join an event jdjkfghjdfhgkjkjghdfkjhgkdfhg', 'Some user accepted your request', 'Some user rejected your request'];

  constructor(private eventsService: EventsService) {

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

  }
}

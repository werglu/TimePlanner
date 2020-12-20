import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CalendarEvent } from 'angular-calendar';
import { Friend, InvitedFriend } from '../../shared/friend';
import { UserService } from '../../user/user.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { FacebookService } from 'ngx-facebook';
import { Events, UsersEvents } from '../../calendar/events';
import { EventsService } from '../../calendar/events.service';
import { UserEventsService, Status } from '../../calendar/userEvents.service';

@Component({
  selector: 'event-details-modal',
  templateUrl: './event-details-modal.component.html',
  styleUrls: ['./event-details-modal.component.css']
})

export class EventDetailsModalComponent implements OnInit {
  editEventForm: FormGroup;
  currentEvent: Events;
  isPublic: boolean;
  userId: string;
  allFriends: Friend[];
  friends: Friend[];
  invited: InvitedFriend[];
  isOwner: boolean;
  private wasInvitedInitialized = false;
  @Input() editedEvent: CalendarEvent;
  @Output() onCancel = new EventEmitter();

  constructor(private formBuilder: FormBuilder,
    public eventsService: EventsService,
    public userService: UserService,
    private notificationService: NotificationsService,
    private userEventsService: UserEventsService,
    private fb: FacebookService) {
    this.editEventForm = this.formBuilder.group({
      title: ' ',
      startDate: '',
      endDate: '',
      city: ' ',
      streetAddress: ' ',
      description: ''
    });

    userService.getUserFriends().subscribe((friendArray) => {
      this.allFriends = friendArray;
      this.friends = friendArray;
    });
    this.invited = [];
  }

  get title() { return this.editEventForm.get('title'); }
  get startDate() { return this.editEventForm.get('startDate'); }
  get startDateTime() { return this.editEventForm.get('startDateTime'); }
  get endDate() { return this.editEventForm.get('endDate'); }
  get endDateTime() { return this.editEventForm.get('endDateTime'); }
  get city() { return this.editEventForm.get('city'); }
  get streetAddress() { return this.editEventForm.get('streetAddress'); }

  ngOnInit(): void {

    let authResp = this.fb.getAuthResponse();
    this.userId = authResp.userID;

    if (this.editedEvent.id != null) {
      this.eventsService.getEvent(Number(this.editedEvent.id)).subscribe((event) => {
        this.currentEvent = event;
        this.isPublic = event.isPublic;
      });
    }
  }

  getStartDate(): string {
    var d = this.editedEvent.start.toLocaleDateString();
    if (d.indexOf('.') >= 0) {
      var date = d.split('.');
      return date[2] + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]) + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]);
    }
    var date = d.split('/');
    return date[2] + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]) + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]);
  }

  getStartTime(): string {
    var h = this.editedEvent.start.getHours();
    var m = this.editedEvent.start.getMinutes();
    var time = ((h.toString().length == 1 ? '0' + h.toString() : h.toString()) + ":" + (m.toString().length == 1 ? '0' + m.toString() : m.toString()));
    return time;
  }

  getEndTime(): string {
    var h = this.editedEvent.end.getHours();
    var m = this.editedEvent.end.getMinutes();
    var time = ((h.toString().length == 1 ? '0' + h.toString() : h.toString()) + ":" + (m.toString().length == 1 ? '0' + m.toString() : m.toString()));
    return time;
  }

  getEndDate(): string {
    var d = this.editedEvent.end.toLocaleDateString();
    if (d.indexOf('.') >= 0) {
      var date = d.split('.');
      return date[2] + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]) + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]);
    }
    var date = d.split('/');
    return date[2] + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]) + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]);
  }

  onSubmit() {
  }

  cancel() {
    this.onCancel.emit();
  }

  getUserEvent(eventId: number, status: number, userId: string): UsersEvents {
    return {
      id: 1,
      eventId: eventId,
      userId: userId,
      status: status
    }
  }

  initializeInvitedList(): boolean {
    if (!this.wasInvitedInitialized) {
      this.userEventsService.getUserEvents(this.userId, (this.editedEvent.id as number))
        .subscribe((x) => { this.isOwner = (x.status == Status.Owner); });
      this.allFriends.forEach((x) => this.userEventsService.getUserEvents(x.FacebookId, (this.editedEvent.id as number))
        .subscribe((y) => {
          if (y.id > -1) {
            this.invited.push({
              FacebookId: x.FacebookId,
              name: x.name,
              photoUrl: x.photoUrl,
              status: y.status,
            });
            this.friends.splice(this.friends.indexOf(x), 1);
          }
        }));

      if (this.allFriends.length > 0)
        this.wasInvitedInitialized = true;
    }
    return true;
  }
}

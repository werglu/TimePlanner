import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Events } from '../events';
import { EventsService } from '../events.service';
import { Friend } from '../../shared/friend';
import { UserService } from '../../user/user.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { Notification } from '../../notifications/notification';
import { Status, UserEventsService } from '../userEvents.service';
import { FacebookService } from 'ngx-facebook';

@Component({
  selector: 'add-event-modal',
  templateUrl: './add-event-modal.component.html',
  styleUrls: ['./add-event-modal.component.css']
})

export class AddEventModalComponent implements OnInit {
  editEventForm: FormGroup;
  @Output() onCancel = new EventEmitter();
  @Output() onChangeVisibility = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<Events>();
  invalidDate = false;
  isPublic = false;
  userId: string;
  friends: Friend[];
  allFriends: Friend[];
  invitedFriendsIds: string[] = [];
  invited: Friend[];

  constructor(private formBuilder: FormBuilder,
    public eventsService: EventsService,
    public userService: UserService,
    public userEventsService: UserEventsService,
    private notificationService: NotificationsService,
    private fb: FacebookService) {
    this.editEventForm = this.formBuilder.group({
      title: ['', Validators.required],
      startDate: '',
      endDate: '',
      city: ['', Validators.required],
      streetAddress: ['', Validators.required]
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
  }

  getFormValue(): Events {
    return {
      id: 1,
      title: (<HTMLInputElement>document.getElementById('title')).value,
      startDate: this.setDate('startDate'),
      endDate: this.setDate('endDate'),
      isPublic: this.isPublic,
      city: (<HTMLInputElement>document.getElementById('city')).value,
      streetAddress: (<HTMLInputElement>document.getElementById('streetAddress')).value,
      latitude: 0.0,
      longitude: 0.0,
      owner: null,
      ownerId: this.userId
    };
  }

  sendInvitations(eventId: number) {
    this.invitedFriendsIds.forEach(friendId => {
      this.userEventsService.addUserEvent({
        id: 1,
        eventId: eventId,
        userId: friendId,
        status: Status.Unknow,
      }).subscribe();
      this.notificationService.addNotification(this.getNotificationToSend(friendId, eventId, 1)).subscribe();
    });
  }
  
  onSubmit() {
    this.validateAllFormControls(this.editEventForm);
    if (this.editEventForm.valid && !this.startDateInvalid() && !this.endDateInvalid() && !this.dateInvalid()) {
      var event = this.getFormValue();
      this.eventsService.addEvent(event).subscribe(() => {
        this.onSave.emit(event);
        this.eventsService.getAllEvents(this.userId).subscribe((events) => {
          var eventId = events.sort((e1, e2) => e2.id - e1.id)[0].id; // get new event id
          this.userEventsService.addUserEvent({
            id: 1,
            eventId: eventId,
            userId: this.userId,
            status: Status.Owner,
          }).subscribe();
          this.sendInvitations(eventId);
        });  
      });
    }
    else {
      this.validateAllFormControls(this.editEventForm);
    }
  }

  validateAllFormControls(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.validateAllFormControls(control);
      }
      else if (control instanceof FormControl) {
        control.markAllAsTouched();
      }
    })
  }

  cancel() {
    this.onCancel.emit();
  }

  startDateInvalid(): boolean {
    return this.setDate('startDate') == null;
  }

  endDateInvalid(): boolean {
    return this.setDate('endDate') == null;
  }

  dateInvalid(): boolean {
    var startDate = this.setDate('startDate');
    var endDate = this.setDate('endDate');
    if (startDate >= endDate) {
      return true;
    }
    return false;
  }

  setDate(value: string): Date {
    var time = (<HTMLInputElement>document.getElementById(value + 'Time')).value;
    var date = (<HTMLInputElement>document.getElementById(value)).valueAsDate;
    var t = time.split(':');
    if (date != null) {
      date.setHours(Number(t[0]));
      date.setMinutes(Number(t[1]));
    }
    return date;
  }

  getStartDate(): string {
    let d: Date = new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  getStartTime() {
    let date: Date = new Date();
    return (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  }

  getEndTime() {
    let date: Date = new Date();
    return (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() + 1 < 10 ? '0' + (date.getMinutes() + 1) : (date.getMinutes() + 1));
  }

  changeVisibility() {
    this.isPublic = !this.isPublic;
    this.onChangeVisibility.emit(this.isPublic);
  }

  getNotificationToSend(friendId: string, eventId: number, id: number): Notification {
    return {
      id: id,
      eventId: eventId,
      event: null,
      senderId: this.userId,
      receiverId: friendId,
      isDismissed: false,
      messageType: 0
    }
  }

  sendInvitation(friend: Friend) {
    this.invitedFriendsIds.push(friend.FacebookId.toString());
    this.invited.push(friend);
    this.friends.splice(this.friends.indexOf(friend), 1);
  }

  search() {
    let value = (<HTMLInputElement>document.getElementById("searchInput")).value.toLowerCase();

    if (value == "") {
      this.friends = this.allFriends.slice();
      return;
    }

    this.friends = [];

    this.allFriends.forEach((x) => {
      if (x.name.toLowerCase().indexOf(value) !== -1) {
        this.friends.push(x);
      }
    });
  }

  checkIfCanInvite(friend: Friend) {
    let canInvite = true;
    if (this.invitedFriendsIds.indexOf(friend.FacebookId) !== -1) {
      canInvite = false;
    };

    return canInvite;
  }
}

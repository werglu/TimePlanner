import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CalendarEvent } from 'angular-calendar';
import { Events, UsersEvents } from '../events';
import { EventsService } from '../events.service';
import { Friend, InvitedFriend } from '../../shared/friend';
import { UserService } from '../../user/user.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { Notification } from '../../notifications/notification';
import { UserEventsService, Status } from '../userEvents.service';
import { FacebookService } from 'ngx-facebook';
import { DefinedPlace } from '../../defined-places/defined-place';
import { DefinedPlacesService } from '../../defined-places/defined-places.service';
import { PlanningService } from '../../planning/planning.service';
import { CommonDateOutput } from '../../planning/commonDateOutput';

@Component({
  selector: 'edit-event-modal',
  templateUrl: './edit-event-modal.component.html',
  styleUrls: ['./edit-event-modal.component.css']
})

export class EditEventModalComponent implements OnInit {
  editEventForm: FormGroup;
  currentEvent: Events;
  isPublic: boolean;
  userId: string;
  allFriends: Friend[];
  friends: Friend[];
  invited: InvitedFriend[];
  isOwner: boolean;
  placesList: any[] = [];
  conflictMessage: string = '';
  conflict: boolean = false;
  geocoder: any;
  private wasInvitedInitialized = false;
  @Input() editedEvent: CalendarEvent;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<Events>();
  @Output() onChangeVisibility = new EventEmitter<boolean>();
  canEditEvent = true;


  constructor(private formBuilder: FormBuilder,
    public eventsService: EventsService,
    public userService: UserService,
    private notificationService: NotificationsService,
    private userEventsService: UserEventsService,
    public planningService: PlanningService,
    private fb: FacebookService,
    private definedPlacesService: DefinedPlacesService) {
    this.editEventForm = this.formBuilder.group({
      title: [' ', Validators.required],
      startDate: '',
      endDate: '',
      city: [' ', Validators.required],
      streetAddress: [' ', Validators.required],
      description: ['', Validators.maxLength(1000)]    
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
    this.geocoder = new google.maps.Geocoder();

    if (this.editedEvent.meta.type == 'event') {
      this.canEditEvent = true;
    }
    else {
      this.canEditEvent = false;
    }

    if (this.editedEvent.id != null) {
      this.eventsService.getEvent(Number(this.editedEvent.id)).subscribe((event) => {
        this.currentEvent = event;
        this.isPublic = event.isPublic;
        this.onChangeVisibility.emit(this.isPublic);
      });
    }

    this.placesList.push({
      id: 1,
      name: 'not selected',
      city: '',
      streetAddress: '',
      ownerId: this.userId,
    });

    this.definedPlacesService.getAllPlaces().subscribe((places) => {
      places.forEach((p) => this.placesList.push(p));
    })
  }

  onPlaceChange(place: DefinedPlace) {
    this.editEventForm.controls.city.setValue(place.city);
    this.editEventForm.controls.city.markAsTouched();
    this.editEventForm.controls.streetAddress.setValue(place.streetAddress);
    this.editEventForm.controls.streetAddress.markAsTouched();
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

  getFormValue(): Events {
    return {
      id: Number(this.editedEvent.id),
      title: (<HTMLInputElement>document.getElementById('title')).value,
      startDate: this.setDate('startDate'),
      endDate: this.setDate('endDate'),
      isPublic: this.isPublic,
      city: (<HTMLInputElement>document.getElementById('city')).value,
      streetAddress: (<HTMLInputElement>document.getElementById('streetAddress')).value,
      latitude: 0.0,
      longitude: 0.0,
      owner: this.currentEvent.owner,
      ownerId: this.currentEvent.ownerId,
      description: (<HTMLInputElement>document.getElementById('description')).value
    };
  }

  onSubmit() {
    this.validateAllFormControls(this.editEventForm);
    if (this.editEventForm.valid && !this.startDateInvalid() && !this.endDateInvalid() && !this.dateInvalid()) {
      var event = this.getFormValue();

      this.geocoder.geocode({ 'address': event.city }, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          var latitude = results[0].geometry.location.lat();
          var longitude = results[0].geometry.location.lng();
          this.geocoder.geocode({ 'address': event.city + ',' + event.streetAddress }, (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              event.latitude = results[0].geometry.location.lat();
              event.longitude = results[0].geometry.location.lng();

              this.eventsService.editEvent(Number(this.editedEvent.id), event).subscribe(() => {
                this.onSave.emit(event);
              });
            }
            else {
              console.log(status);
            }
          });
        }
        else {
          console.log(status);
        }
      });
    }
    else {
      this.validateAllFormControls(this.editEventForm);
    }
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
    if (time && date != null) {
      var t = time.split(':');
      date.setHours(Number(t[0]));
      date.setMinutes(Number(t[1]));
      return date;
    }
    return null;
  }

  changeVisibility() {
    this.isPublic = !this.isPublic;
    this.onChangeVisibility.emit(this.isPublic);
  }

  sendInvitation(friend: Friend) {
    // todo: do this on save
    this.notificationService.sendInviteNotification(+this.editedEvent.id, friend.FacebookId.toString()).subscribe(() => {
      this.invited.push({
        FacebookId: friend.FacebookId,
        name: friend.name,
        photoUrl: friend.photoUrl,
        status: Status.Unknow,
      });
      this.friends.splice(this.friends.indexOf(friend), 1);
    });
    this.findCommonDate();
  }

  getUserEvent(eventId: number, status: number, userId: string): UsersEvents {
    return {
      id: 1,
      eventId: eventId,
      userId: userId,
      status: status
    }
  }

  getNotificationToSend(friendId: string, eventId: number): Notification {
    return {
      id: 1,
      eventId: eventId,
      event: null,
      senderId: this.userId,
      receiverId: friendId,
      isDismissed: false,
      messageType: 0
    }
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
            this.findCommonDate();
          }
        }));

      if (this.allFriends.length > 0)
        this.wasInvitedInitialized = true;
    }
    return true;
  }

  checkIfCanInvite(friend: Friend) {
    let canInvite = true;
    this.invited.forEach((x) => {
      if (x.FacebookId == friend.FacebookId)
        canInvite = false;
    });

    return canInvite;
  }

  findCommonDate() {
    if (!this.startDateInvalid() && !this.endDateInvalid() && !this.dateInvalid()) {
      var userIds: string[] = [this.userId];
      var startDate = this.setDate('startDate');
      var endDate = this.setDate('endDate');
      this.invited.forEach(friend => userIds.push(friend.FacebookId));
      this.planningService.findCommonDate(userIds, startDate, endDate, (this.editedEvent.id as number)).subscribe(output => {
        this.getConflictMessage(output);
      })
    }
    else {
      this.conflictMessage = "";
      this.conflict = false;
    }
  }

  getConflictMessage(output: CommonDateOutput) {
    if (output.conflictingUsers.length == 0) {
      this.conflictMessage = 'Everyone invited in available during selected time';
      this.conflict = false
      return;
    }

    var names = [];
    output.conflictingUsers.forEach(conflictingUserId => {
      if (conflictingUserId != this.userId) {
        var conflictingFriend = this.invited.find(friend => friend.FacebookId == conflictingUserId);
        if (conflictingFriend) {
          names.push(conflictingFriend.name);
        }
      }
    });

    var message = '';
    if (names.length == 0) {
      if (output.conflictingUsers.includes(this.userId)) {
        message = 'You are';
      }
      else {
        this.conflictMessage = 'Everyone invited in available during selected time';
        this.conflict = false
        return;
      }
    }
    else {
      if (output.conflictingUsers.includes(this.userId)) {
        names.unshift('You');
      }
      if (names.length == 1) {
        message = names[0] + ' is';
      }
      else {
        for (var ind = 0; ind < names.length - 2; ind++) {
          message = message + names[ind] + ', '
        }
        message = message + names[names.length - 2] + ' and ' + names[names.length - 1] + ' are';
      }
    }

    this.conflictMessage = message + ' busy during selected time.\n\nYou can try ' + output.commonDate.toString().replace('T', ' ');
    this.conflict = true;
  }
}

import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Events } from '../events';
import { EventsService } from '../events.service';
import { Friend } from '../../shared/friend';
import { UserService } from '../../user/user.service';

declare var FB: any;

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
  invited: Friend[];

  constructor(private formBuilder: FormBuilder,
    public eventsService: EventsService,
    public userService: UserService) {
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
    (window as any).fbAsyncInit = () => {
      FB.init({
        appId: '343708573552335',
        cookie: true,
        xfbml: true,
        version: 'v8.0',
      });

      (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }

    FB.api('/me', (response) => {
      this.userId = response.id;
    });
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

  onSubmit() {
    this.validateAllFormControls(this.editEventForm);
    if (this.editEventForm.valid && !this.startDateInvalid() && !this.endDateInvalid() && !this.dateInvalid()) {
      this.eventsService.addEvent(this.getFormValue()).subscribe(() => this.onSave.emit(this.getFormValue()));
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

  sendInvitation(friend: Friend) {
    // TODO!
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
    if (this.invited.indexOf(friend) !== -1) {
      canInvite = false;
    };

    return canInvite;
  }
}

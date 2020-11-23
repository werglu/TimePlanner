import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CalendarEvent } from 'angular-calendar';
import { Events } from '../events';
import { EventsService } from '../events.service';
import { Friend } from '../../shared/friend';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'edit-event-modal',
  templateUrl: './edit-event-modal.component.html',
  styleUrls: ['./edit-event-modal.component.css']
})

export class EditEventModalComponent implements OnInit {
  editEventForm: FormGroup;
  currentEvent: Events;
  isPublic: boolean;
  allFriends: Friend[];
  friends: Friend[];
  @Input() editedEvent: CalendarEvent;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<Events>();
  @Output() onChangeVisibility = new EventEmitter<boolean>();

  constructor(private formBuilder: FormBuilder,
    public eventsService: EventsService,
    public userService: UserService) {
    this.editEventForm = this.formBuilder.group({
      title: [' ', Validators.required],
      startDate: '',
      endDate: '',
      city: [' ', Validators.required],
      streetAddress: [' ', Validators.required]
    });

    this.friends = userService.getUserFriends();
    this.allFriends = userService.getUserFriends();
  }

  get title() { return this.editEventForm.get('title'); }
  get startDate() { return this.editEventForm.get('startDate'); }
  get startDateTime() { return this.editEventForm.get('startDateTime'); }
  get endDate() { return this.editEventForm.get('endDate'); }
  get endDateTime() { return this.editEventForm.get('endDateTime'); }
  get city() { return this.editEventForm.get('city'); }
  get streetAddress() { return this.editEventForm.get('streetAddress'); }

  ngOnInit(): void {
    if (this.editedEvent.id != null) {
      this.eventsService.getEvent(Number(this.editedEvent.id)).subscribe((event) => {
        this.currentEvent = event;
        this.isPublic = event.isPublic;
        this.onChangeVisibility.emit(this.isPublic);
      });
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
      longitude: 0.0
    };
  }

  onSubmit() {
    this.validateAllFormControls(this.editEventForm);
    if (this.editEventForm.valid && !this.dateInvalid()) {
      this.eventsService.editEvent(Number(this.editedEvent.id), this.getFormValue()).subscribe(() => this.onSave.emit(this.getFormValue()));
    }
    else {
      this.validateAllFormControls(this.editEventForm);
    }
  }

  cancel() {
    this.onCancel.emit();
  }

  dateInvalid(): boolean {
    var startDate = this.setDate('startDate');
    var endDate = this.setDate('endDate');
    if (startDate > endDate) {
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

  changeVisibility() {
    this.isPublic = !this.isPublic;
    this.onChangeVisibility.emit(this.isPublic);
  }

  sendInvitation(friend: Friend) {
    // TODO!
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
}

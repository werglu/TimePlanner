import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";
import { CalendarEvent } from "angular-calendar";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: 'attended-fb-event-details-modal',
  templateUrl: './attended-fb-event-details-modal.component.html'
})

export class AttendedFbEventDetailsModalComponent implements OnInit {
  editEventForm: FormGroup;
  showEndDate: boolean = true;
  showPlace: boolean = true;
  showDesc: boolean = true;
  showTitle: boolean = true;
  @Input() editedEvent: CalendarEvent;
  @Output() onCancel = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {
    this.editEventForm = this.formBuilder.group({
      title: ' ',
      startDate: '',
      endDate: '',
      place: ' ',
      description: ''
    });
  }

  ngOnInit(): void {
    if (this.editedEvent.end.toString() === this.editedEvent.start.toString())
      this.showEndDate = false;

    if (!this.editedEvent.hasOwnProperty('place'))
      this.showPlace = false;

    if (this.editedEvent.description === '')
      this.showDesc = false;

    if (this.editedEvent.title === '')
      this.showTitle = false;
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
    if (!this.showEndDate) {
      return;
    }
    var h = this.editedEvent.end.getHours();
    var m = this.editedEvent.end.getMinutes();
    var time = ((h.toString().length == 1 ? '0' + h.toString() : h.toString()) + ":" + (m.toString().length == 1 ? '0' + m.toString() : m.toString()));
    return time;
  }

  getEndDate(): string {
    if (!this.showEndDate) {
      return;
    }
    var d = this.editedEvent.end.toLocaleDateString();
    if (d.indexOf('.') >= 0) {
      var date = d.split('.');
      return date[2] + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]) + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]);
    }
    var date = d.split('/');
    return date[2] + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]) + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]);
  }

  cancel() {
    this.onCancel.emit();
  }
}

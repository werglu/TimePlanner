import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CalendarEvent } from 'angular-calendar';
import { Events } from '../events';
import { EventsService } from '../events.service';

@Component({
  selector: 'edit-event-modal',
  templateUrl: './edit-event-modal.component.html'
})

export class EditEventModalComponent implements OnInit {
  editEventForm: FormGroup;  
  @Input() editedEvent: CalendarEvent;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<Events>();

  constructor(private formBuilder: FormBuilder,
    public eventsService: EventsService) {
    this.editEventForm = this.formBuilder.group({
      title: '',
      startDate: '',
      endDate: ''
    });
  }

  ngOnInit(): void {
  }

  getStartDate(): string {
    var date = this.editedEvent.start.toLocaleDateString().split(".");
    return date[2] + '-' + date[1] + '-' + date[0];
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
    var date = this.editedEvent.end.toLocaleDateString().split(".");
    return date[2] + '-' + date[1] + '-' + date[0];
  }

  getFormValue(): Events {
    return {
      id: Number(this.editedEvent.id),
      title: (<HTMLInputElement>document.getElementById('title')).value,
      startDate: this.setDate('startDate'),
      endDate: this.setDate('endDate'),
      latitude: 0.0,
      longitude: 0.0
    };
  }

  onSubmit() {
    this.eventsService.editEvent(Number(this.editedEvent.id), this.getFormValue()).subscribe(() => this.onSave.emit(this.getFormValue()));
    
  }

  cancel() {
    this.onCancel.emit();
  }

  setDate(value: string): Date {
    var time = (<HTMLInputElement>document.getElementById(value + 'Time')).value;
    var date = (<HTMLInputElement>document.getElementById(value)).valueAsDate;
    var t = time.split(':');
    date.setHours(Number(t[0]));
    date.setMinutes(Number(t[1]));
    return date;
  }
}

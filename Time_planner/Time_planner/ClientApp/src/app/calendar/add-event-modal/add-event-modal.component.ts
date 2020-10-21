import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CalendarEvent } from 'angular-calendar';
import { Events } from '../events';
import { EventsService } from '../events.service';

@Component({
  selector: 'add-event-modal',
  templateUrl: './add-event-modal.component.html'
})

export class AddEventModalComponent implements OnInit {
  editEventForm: FormGroup;  
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

  getFormValue(): Events {
    return {
      id: 1,
      title: (<HTMLInputElement>document.getElementById('title')).value,
      startDate: this.setDate('startDate'),
      endDate: this.setDate('endDate')
    };
  }

  onSubmit() {
    this.eventsService.addEvent(this.getFormValue()).subscribe(() => this.onSave.emit(this.getFormValue())); 
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

import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Events } from '../events';
import { EventsService } from '../events.service';

@Component({
  selector: 'add-event-modal',
  templateUrl: './add-event-modal.component.html',
  styleUrls: ['./add-event-modal.component.css']
})

export class AddEventModalComponent implements OnInit {
  editEventForm: FormGroup;  
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<Events>();
  invalidDate = false;

  constructor(private formBuilder: FormBuilder,
    public eventsService: EventsService) {
    this.editEventForm = this.formBuilder.group({
      title: ['', Validators.required],
      startDate: '',
      endDate: ''
    });
  }

  get title() { return this.editEventForm.get('title'); }
  get startDate() { return this.editEventForm.get('startDate'); }
  get startDateTime() { return this.editEventForm.get('startDateTime'); }
  get endDate() { return this.editEventForm.get('endDate'); }
  get endDateTime() { return this.editEventForm.get('endDateTime'); }

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
}

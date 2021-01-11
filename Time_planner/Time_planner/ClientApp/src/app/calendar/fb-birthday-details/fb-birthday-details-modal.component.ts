import { Component, EventEmitter, Output, Input } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { CalendarElement } from "../CalendarElement";

@Component({
  selector: 'fb-birthday-details-modal',
  templateUrl: './fb-birthday-details-modal.component.html',
  styleUrls: ['./fb-birthday-details-modal.component.css']
})

export class FbBirthdayDetailsModalComponent {
  editEventForm: FormGroup;
  @Input() editedEvent: CalendarElement;
  @Output() onCancel = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {
    this.editEventForm = this.formBuilder.group({
      description: ''
    });
  }

  cancel() {
    this.onCancel.emit();
  }

  onSubmit() {
  }
}

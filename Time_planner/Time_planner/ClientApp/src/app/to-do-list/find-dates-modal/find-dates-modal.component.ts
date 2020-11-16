import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TaskAssignmentProposition } from '../taskAssignmentProposition';

@Component({
  selector: 'find-dates-modal',
  templateUrl: './find-dates-modal.component.html',
  styleUrls: ['./find-dates-modal.component.css']
})

export class FindDatesModalComponent implements OnInit {
  findDatesForm: FormGroup;
  @Input() foundDates: Array<TaskAssignmentProposition>;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<TaskAssignmentProposition>();

  constructor(private formBuilder: FormBuilder) {
    this.findDatesForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  get name() { return this.findDatesForm.get('name'); }

  ngOnInit(): void {
  }

  cancel() {
    this.onCancel.emit();
  }

  //getFormValue(): TaskAssignmentProposition {
  //  return {
  //    id: 1,  
  //    category: (<HTMLInputElement>document.getElementById('name')).value,
  //    tasks: null
  //  };
  //}
  
  onSubmit() {
    //if (this.addCategoryForm.valid) {
    //  this.listCategoriesService.addCategory(this.getFormValue()).subscribe(() => this.onSave.emit(this.getFormValue()));
    //}
    //else {
    //  this.validateAllFormControls(this.addCategoryForm);
    //}
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
}

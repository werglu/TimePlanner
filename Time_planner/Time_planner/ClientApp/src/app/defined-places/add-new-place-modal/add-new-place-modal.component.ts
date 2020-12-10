import { Component, Input, Output, EventEmitter } from "@angular/core";
import { DefinedPlace } from "../defined-place";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { DefinedPlacesService } from "../defined-places.service";

@Component({
  selector: 'add-new-place-modal',
  templateUrl: './add-new-place-modal.component.html',
  styleUrls: ['./add-new-place-modal.component.css']
})

export class AddNewPlaceModalComponent {
  addPlaceForm: FormGroup;
  @Input() userId: string;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<DefinedPlace>();

  constructor(private formBuilder: FormBuilder,
    private definedPlacesService: DefinedPlacesService) {
    this.addPlaceForm = this.formBuilder.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      streetAddress: ['', Validators.required],
    });
  }

  get name() { return this.addPlaceForm.get('name'); }
  get city() { return this.addPlaceForm.get('city'); }
  get streetAddress() { return this.addPlaceForm.get('streetAddress'); }

  getFormValue(): DefinedPlace {
    return {
      id: 1,
      name: (<HTMLInputElement>document.getElementById('name')).value,
      city: (<HTMLInputElement>document.getElementById('city')).value,
      streetAddress: (<HTMLInputElement>document.getElementById('streetAddress')).value,
      ownerId: this.userId,
    };
  }

  onSubmit() {
    if (this.addPlaceForm.valid) {
      let newPlace = this.getFormValue();
      this.definedPlacesService.addPlace(newPlace).subscribe(() => this.onSave.emit(newPlace));
    }
    else {
      this.validateAllFormControls(this.addPlaceForm);
    }
  }

  validateAllFormControls(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      let control = formGroup.get(field);
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
}

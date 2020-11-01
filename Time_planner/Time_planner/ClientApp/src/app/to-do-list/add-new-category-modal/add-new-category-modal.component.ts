import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ListCategory } from '../listCategory';
import { ListCategoriesService } from '../listCategories.service';

@Component({
  selector: 'add-new-category-modal',
  templateUrl: './add-new-category-modal.component.html',
  styleUrls: ['./add-new-category-modal.component.css']
})

export class AddNewCategoryModalComponent implements OnInit {
  addCategoryForm: FormGroup;  
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<ListCategory>();

  constructor(private formBuilder: FormBuilder,
    private listCategoriesService: ListCategoriesService) {
    this.addCategoryForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  get name() { return this.addCategoryForm.get('name'); }

  ngOnInit(): void {
  }

  cancel() {
    this.onCancel.emit();
  }

  getFormValue(): ListCategory {
    return {
      id: 1,  
      category: (<HTMLInputElement>document.getElementById('name')).value,
      tasks: null
    };
  }
  
  onSubmit() {
    if (this.addCategoryForm.valid) {
      this.listCategoriesService.addCategory(this.getFormValue()).subscribe(() => this.onSave.emit(this.getFormValue()));
    }
    else {
      this.validateAllFormControls(this.addCategoryForm);
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
}

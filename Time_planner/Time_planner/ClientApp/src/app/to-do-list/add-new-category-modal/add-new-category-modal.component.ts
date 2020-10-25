import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ListCategory } from '../listCategory';
import { ListCategoriesService } from '../listCategories.service';

@Component({
  selector: 'add-new-category-modal',
  templateUrl: './add-new-category-modal.component.html'
})

export class AddNewCategoryModalComponent implements OnInit {
  addCategoryForm: FormGroup;  
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<ListCategory>();

  constructor(private formBuilder: FormBuilder,
    private listCategoriesService: ListCategoriesService) {
    this.addCategoryForm = this.formBuilder.group({
      name: ''
    });
  }

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
    this.listCategoriesService.addCategory(this.getFormValue()).subscribe(() => this.onSave.emit(this.getFormValue()));
  }
}

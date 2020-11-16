import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ListCategory } from '../listCategory';
import { ListCategoriesService } from '../listCategories.service';
import { Task } from '../task';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'add-new-task-modal',
  templateUrl: './add-new-task-modal.component.html',
  styleUrls: ['./add-new-task-modal.component.css']
})

export class AddNewTaskModalComponent implements OnInit {
  addTaskForm: FormGroup;
  public listCategories: Array<ListCategory> = [];
  public priorities: Array<string> = ['High priority', 'Medium priority', 'Low priority'];
  currentCategory: ListCategory;
  choosenPriority = 1;
  public addDatesOff = true;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<Task>();

  constructor(private formBuilder: FormBuilder,
    private listCategoriesService: ListCategoriesService,
    private tasksService: TasksService) {
    this.addTaskForm = this.formBuilder.group({
      category: '',
      title: ['', Validators.required],
      priority: ''
    });
  }

  get title() { return this.addTaskForm.get('title'); }

  ngOnInit(): void {
    this.getCategories();
  }

  cancel() {
    this.onCancel.emit();
  }

  getCategories() {
    this.listCategoriesService.getAllListCategories().subscribe(lc => {
      lc.forEach(c => this.listCategories.push(c));
      this.currentCategory = this.listCategories[0];
    });
  }

  onCategoryChange(category: ListCategory) {
    this.currentCategory = category;
  }

  turnOnAddDates() {
    this.addDatesOff = false;
  }

  turnOffAddDates() {
    this.addDatesOff = true;
  }

  onPriorityChange(priority: string) {
    if (priority == this.priorities[0]) {
      this.choosenPriority = 0;
    }     
    if (priority == this.priorities[1]) {
      this.choosenPriority = 1;
    }
    if (priority == this.priorities[2]) {
      this.choosenPriority = 2;
    }
  }

  getFormValue(): Task {
    return {
      id: 13,
      category:  this.currentCategory,
      categoryId: this.currentCategory.id,
      isDone: false,
      title: (<HTMLInputElement>document.getElementById('title')).value,
      priority: this.choosenPriority
    };
  }
  
  onSubmit() {
    if (this.addTaskForm.valid) {
      this.tasksService.addTask(this.getFormValue()).subscribe(() => this.onSave.emit(this.getFormValue()));
    }
    else {
      this.validateAllFormControls(this.addTaskForm);
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

  setDate(value: string): Date {
    if (this.addDatesOff) return null;
    var date = (<HTMLInputElement>document.getElementById(value)).valueAsDate;
    return date;
  }
}

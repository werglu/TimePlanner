import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ListCategory } from '../listCategory';
import { ListCategoriesService } from '../listCategories.service';
import { Task } from '../task';
import { TasksService } from '../tasks.service';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'edit-task-modal',
  templateUrl: './edit-task-modal.component.html',
  styleUrls: ['./edit-task-modal.component.css']
})

export class EditTaskModalComponent implements OnInit {
  editTaskForm: FormGroup;
  public listCategories: Array<ListCategory> = [];
  public priorities: Array<string> = ['High priority', 'Medium priority', 'Low priority'];
  currentCategory: ListCategory;
  currentTask: Task;
  isDone = false;
  addDatesOff = true;
  choosenPriority = 1;
  @Input() userId: string;
  @Input() editedTask: Task;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<Task>();

  constructor(private formBuilder: FormBuilder,
    private listCategoriesService: ListCategoriesService,
    private tasksService: TasksService) {
    this.editTaskForm = this.formBuilder.group({
      category: '',
      title: ['title', Validators.required],
      priority: '',
      city: ' ',
      streetAddress: ' '
    });
  }

  get title() { return this.editTaskForm.get('title'); }
  get city() { return this.editTaskForm.get('city'); }
  get streetAddress() { return this.editTaskForm.get('streetAddress'); }

  ngOnInit(): void {
    this.getCategories();
    if (this.editedTask.id != null) {
      this.tasksService.getTask(Number(this.editedTask.id)).subscribe((task) => {
        this.currentTask = task;
        this.currentCategory = (this.listCategories.filter(c => c.id == task.categoryId))[0];
      });
    }
  }

  cancel() {
    this.onCancel.emit();
  }

  checked(isDone: boolean) {
    this.isDone = isDone;
  }

  getCategories() {
    this.listCategoriesService.getAllListCategoriesPerUser(this.userId).subscribe(lc => {
      lc.forEach(c => this.listCategories.push(c));
      if (this.currentTask != null) {
        this.currentCategory = (this.listCategories.filter(c => c.id == this.currentTask.categoryId))[0];
      }
    });
  }

  onCategoryChange(category: ListCategory) {
    this.currentCategory = category;
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
      id: Number(this.editedTask.id),
      category:  this.currentCategory,
      categoryId: this.currentCategory.id,
      isDone: this.isDone,
      title: (<HTMLInputElement>document.getElementById('title')).value,
      priority: this.choosenPriority,
      date0: this.editedTask.date0 == null ? null :  new Date(this.editedTask.date0),
      date1: this.editedTask.date1 == null ? null : new Date(this.editedTask.date1),
      date2: this.editedTask.date2 == null ? null : new Date(this.editedTask.date2),
      date3: this.editedTask.date3 == null ? null : new Date(this.editedTask.date3),
      date4: this.editedTask.date4 == null ? null : new Date(this.editedTask.date4),
      date5: this.editedTask.date5 == null ? null : new Date(this.editedTask.date5),
      date6: this.editedTask.date6 == null ? null : new Date(this.editedTask.date6),
      city: (<HTMLInputElement>document.getElementById('city')).value,
      streetAddress: (<HTMLInputElement>document.getElementById('streetAddress')).value
    };
  }
  
  onSubmit() {
    if (this.editTaskForm.valid) {
      this.tasksService.editTask(Number(this.editedTask.id), this.getFormValue()).subscribe(() => this.onSave.emit(this.getFormValue()));
    }
    else {
      this.validateAllFormControls(this.editTaskForm);
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

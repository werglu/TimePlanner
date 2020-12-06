import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ListCategory } from '../listCategory';
import { ListCategoriesService } from '../listCategories.service';
import { Task } from '../task';
import { TasksService } from '../tasks.service';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'edit-task-as-event-modal',
  templateUrl: './edit-task-as-event-modal.component.html',
  styleUrls: ['./edit-task-as-event-modal.component.css']
})

export class EditTaskAaEventModalComponent implements OnInit {
  editTaskForm: FormGroup;
  public listCategories: Array<ListCategory> = [];
  public priorities: Array<string> = ['High priority', 'Medium priority', 'Low priority'];
  currentCategory: ListCategory;
  currentTask: Task;
  isDone = false;
  choosenPriority = 1;
  @Input() userId: string;
  @Input() editedTask: CalendarEvent;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<Task>();

  constructor(private formBuilder: FormBuilder,
    private listCategoriesService: ListCategoriesService,
    private tasksService: TasksService) {
    this.editTaskForm = this.formBuilder.group({
      category: '',
      title: ['title', Validators.required],
      priority: '',
      date0: '',
      date1: '',
      date2: '',
      date3: '',
      date4: '',
      date5: '',
      date6: ''
    });
  }

  get title() { return this.editTaskForm.get('title'); }
  get date0() { return this.editTaskForm.get('date0'); }
  get date1() { return this.editTaskForm.get('date1'); }
  get date2() { return this.editTaskForm.get('date2'); }
  get date3() { return this.editTaskForm.get('date3'); }
  get date4() { return this.editTaskForm.get('date4'); }
  get date5() { return this.editTaskForm.get('date5'); }
  get date6() { return this.editTaskForm.get('date6'); }

  ngOnInit(): void {
    this.getCategories();
    if (this.editedTask.id != null) {
      this.tasksService.getTask(Number(this.editedTask.id)).subscribe((task) => {
        this.currentTask = task;
        this.currentCategory = (this.listCategories.filter(c => c.id == task.categoryId))[0];
        this.choosenPriority = task.priority;
      });
    }
  }

  cancel() {
    this.onCancel.emit();
  }

  checked(isDone: boolean) {
    this.isDone = isDone;
  }

  getDate(ind: number): string {
    if (!this.currentTask) {
      return null;
    }
    if (ind == 0)
      var d = this.currentTask.date0;
    else if (ind == 1)
      var d = this.currentTask.date1;
    else if (ind == 2)
      var d = this.currentTask.date2;
    else if (ind == 3)
      var d = this.currentTask.date3;
    else if (ind == 4)
      var d = this.currentTask.date4;
    else if (ind == 5)
      var d = this.currentTask.date5;
    else if (ind == 6)
      var d = this.currentTask.date6;
    if (!d) {
      return null;
    }
    var dLocale = (new Date(d)).toLocaleDateString();
    if (dLocale.indexOf('.') >= 0) {
      var date = dLocale.split('.');
      return date[2] + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]) + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]);
    }
    var date = dLocale.split('/');
    return date[2] + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]) + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]);
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
      date0: new Date(this.setDate('date0')),
      date1: new Date(this.setDate('date1')),
      date2: new Date(this.setDate('date2')),
      date3: new Date(this.setDate('date3')),
      date4: new Date(this.setDate('date4')),
      date5: new Date(this.setDate('date5')),
      date6: new Date(this.setDate('date6'))
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

  setDate(value: string): Date {
    var v = (<HTMLInputElement>document.getElementById(value));
    if (v) return v.valueAsDate;
    return new Date('0001-01-01T00:00:00Z');
  }
}

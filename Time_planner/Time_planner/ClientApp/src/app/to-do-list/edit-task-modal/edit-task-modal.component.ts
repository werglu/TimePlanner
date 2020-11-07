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
  choosenPriority = 1;
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
      startDate: '',
      endDate: ''
    });
  }

  get title() { return this.editTaskForm.get('title'); }
  get startDate() { return this.editTaskForm.get('startDate'); }
  get startDateTime() { return this.editTaskForm.get('startDateTime'); }
  get endDate() { return this.editTaskForm.get('endDate'); }
  get endDateTime() { return this.editTaskForm.get('endDateTime'); }

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

  getStartDate(): string {
    var d = this.editedTask.start.toLocaleDateString();
    if (d.indexOf('.') >= 0) {
      var date = d.split('.');
      return date[2] + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]) + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]);
    }
    var date = d.split('/');
    return date[2] + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]) + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]);
  }

  getStartTime(): string {
    var h = this.editedTask.start.getHours();
    var m = this.editedTask.start.getMinutes();
    var time = ((h.toString().length == 1 ? '0' + h.toString() : h.toString()) + ":" + (m.toString().length == 1 ? '0' + m.toString() : m.toString()));
    return time;
  }

  getEndTime(): string {
    var h = this.editedTask.end.getHours();
    var m = this.editedTask.end.getMinutes();
    var time = ((h.toString().length == 1 ? '0' + h.toString() : h.toString()) + ":" + (m.toString().length == 1 ? '0' + m.toString() : m.toString()));
    return time;
  }

  getEndDate(): string {
    var d = this.editedTask.end.toLocaleDateString();
    if (d.indexOf('.') >= 0) {
      var date = d.split('.');
      return date[2] + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]) + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]);
    }
    var date = d.split('/');
    return date[2] + '-' + (date[0].length == 1 ? '0' + date[0] : date[0]) + '-' + (date[1].length == 1 ? '0' + date[1] : date[1]);
  }

  getCategories() {
    this.listCategoriesService.getAllListCategories().subscribe(lc => {
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
      startDate: this.setDate('startDate'),
      endDate: this.setDate('endDate')
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
    var time = (<HTMLInputElement>document.getElementById(value + 'Time')).value;
    var date = (<HTMLInputElement>document.getElementById(value)).valueAsDate;
    var t = time.split(':');
    if (date != null) {
      date.setHours(Number(t[0]));
      date.setMinutes(Number(t[1]));
    }
    return date;
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
}

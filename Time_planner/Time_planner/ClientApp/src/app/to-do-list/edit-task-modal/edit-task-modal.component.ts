import { Component, OnInit, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ListCategory } from '../listCategory';
import { ListCategoriesService } from '../listCategories.service';
import { Task } from '../task';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'edit-task-modal',
  templateUrl: './edit-task-modal.component.html',
  styleUrls: ['./edit-task-modal.component.css']
})

export class EditTaskModalComponent implements OnInit {
  editTaskForm: FormGroup;
  public listCategories: Array<ListCategory> = [];
  public priorities: Array<string> = ['High priority', 'Medium priority', 'Low priority'];
  public splits: Array<number> = [1, 2, 3, 4, 5, 6];
  public hours: Array<number> = Array.from({ length: 51 }, (v, k) => k)
  public minutes: Array<number> = [0, 5, 15, 30, 45]
  checkedDays: Array<boolean> = [true, false, false, false, false, false, false]
  currentCategory: ListCategory;
  currentTask: Task;
  isDone = false;
  addDatesOff = true;
  choosenPriority = 1;
  choosenSplit = 1;
  choosenHour = 1;
  choosenMinute = 0;
  choosenHourIndex = 1;
  choosenMinuteIndex = 0;
  choosenDays = 1;

  public addDateConstraintsOff = true;
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
        if (task.time != null) {
          this.turnOnAddDateConstraints();
          this.choosenHour = Math.floor(task.time / 60);
          this.choosenHourIndex = this.choosenHour;
          this.choosenMinute = task.time - (60 * this.choosenHour);
          this.choosenMinuteIndex = this.minutes.findIndex(m => m == this.choosenMinute);
          this.choosenSplit = task.split;
          this.getSelectedDays(this.currentTask.days);
        }
      });
    }
  }

  turnOnAddDates() {
    this.addDatesOff = false;
  }

  turnOffAddDates() {
    this.addDatesOff = true;
  }

  turnOnAddDateConstraints() {
    this.addDateConstraintsOff = false;
    this.splits = [1, 2, 3, 4, 5];
  }

  turnOffAddDateConstraints() {
    this.addDateConstraintsOff = true;
  }

  cancel() {
    this.onCancel.emit();
  }

  checked(isDone: boolean) {
    this.isDone = isDone;
  }

  getSelectedDays(days: number) {
    this.choosenDays = days;
    this.checkedDays[0] = false; //update default value

    var count = 0;
    if (days >= 64) {
      this.checkedDays[6] = true;
      days -= 64;
      count++;
    }
    if (days >= 32) {
      this.checkedDays[65] = true;
      days -= 32; count++;
    }
    if (days >= 16) {
      this.checkedDays[4] = true;
      days -= 16; count++;
    }
    if (days >= 8) {
      this.checkedDays[3] = true;
      days -= 8; count++;
    }
    if (days >= 4) {
      this.checkedDays[2] = true;
      days -= 4; count++;
    }
    if (days >= 2) {
      this.checkedDays[1] = true;
      days -= 2; count++;
    }
    if (days >= 1) {
      this.checkedDays[0] = true;
      days -= 1; count++;
    }

    this.splits = Array.from({ length: count }, (v, k) => k + 1)
    if (this.choosenSplit > this.splits.length) {
      this.choosenSplit = 1;
    }
  }

  onDayChange() {
    var days = 0;
    var count = 0;
    var day = 6;
    var daysOfWeek = ["sun", "sat", "fri", "thu", "wed", "tue", "mon"];
    daysOfWeek.forEach((dayOfWeek) => {
      days *= 2;
      var element = document.getElementById('weekday-' + dayOfWeek) as HTMLInputElement
      if (element.checked) {
        this.checkedDays[day] = true;
        days += 1;
        count += 1;
      }
      else {
        this.checkedDays[day] = false;
      }
      day--;
    });
    this.choosenDays = days;
    this.splits = Array.from({ length: count }, (v, k) => k + 1)
    if (this.choosenSplit > this.splits.length) {
      this.choosenSplit = 1;
    }
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

  onSplitChange(split: number) {
    this.choosenSplit = split;
  }

  onHourChange(hour: number) {
    this.choosenHour = hour;
  }

  onMinuteChange(minute: number) {
    this.choosenMinute = minute;
  }

  getFormValue(): Task {
    return {
      id: Number(this.editedTask.id),
      category: this.currentCategory,
      categoryId: this.currentCategory.id,
      isDone: this.isDone,
      title: (<HTMLInputElement>document.getElementById('title')).value,
      priority: this.choosenPriority,
      split: this.choosenSplit,
      days: this.choosenDays,
      time: this.choosenHour * 60 + this.choosenMinute,
      date0: this.editedTask.date0 == null ? null : new Date(this.editedTask.date0),
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

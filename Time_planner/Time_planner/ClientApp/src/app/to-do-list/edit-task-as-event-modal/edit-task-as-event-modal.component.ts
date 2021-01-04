import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ListCategory } from '../listCategory';
import { ListCategoriesService } from '../listCategories.service';
import { Task } from '../task';
import { TasksService } from '../tasks.service';
import { CalendarEvent } from 'angular-calendar';
import { DefinedPlace } from '../../defined-places/defined-place';
import { DefinedPlacesService } from '../../defined-places/defined-places.service';

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
  geocoder: any;
  isDone = false;
  choosenPriority = 1;
  placesList: any[] = [];
  @Input() userId: string;
  @Input() editedTask: CalendarEvent;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<Task>();

  constructor(private formBuilder: FormBuilder,
    private listCategoriesService: ListCategoriesService,
    private tasksService: TasksService,
    private definedPlacesService: DefinedPlacesService) {
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
      date6: '',
      city: ' ',
      streetAddress: ' '
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
  get city() { return this.editTaskForm.get('city'); }
  get streetAddress() { return this.editTaskForm.get('streetAddress'); }

  ngOnInit(): void {
    this.getCategories();
    this.geocoder = new google.maps.Geocoder();
    if (this.editedTask.id != null) {
      this.tasksService.getTask(Number(this.editedTask.id)).subscribe((task) => {
        this.currentTask = task;
        this.currentCategory = (this.listCategories.filter(c => c.id == task.categoryId))[0];
        this.choosenPriority = task.priority;
      });

      this.placesList.push({
        id: 1,
        name: 'not selected',
        city: '',
        streetAddress: '',
        ownerId: this.userId,
      });

      this.definedPlacesService.getAllPlaces().subscribe((places) => {
        places.forEach((p) => this.placesList.push(p));
      });
    }
  }

  cancel() {
    this.onCancel.emit();
  }

  checked(isDone: boolean) {
    this.isDone = isDone;
  }

  addDate() {
    var firstFreeDateInd = this.getFirstFreeDate(0);
    if (firstFreeDateInd != -1) {
      if (firstFreeDateInd == 0) {
        this.currentTask.date0 = new Date();
      }
      if (firstFreeDateInd == 1) {
        this.currentTask.date1 = new Date();
      }
      if (firstFreeDateInd == 2) {
        this.currentTask.date2 = new Date();
      }
      if (firstFreeDateInd == 3) {
        this.currentTask.date3 = new Date();
        this.currentTask.date3 = new Date();
      }
      if (firstFreeDateInd == 4) {
        this.currentTask.date4 = new Date();
      }
      if (firstFreeDateInd == 5) {
        this.currentTask.date5 = new Date();
      }
      if (firstFreeDateInd == 6) {
        this.currentTask.date6 = new Date();
      }
    }
  }

  // returns -1 when there all daets are taken
  getFirstFreeDate(startInd: number): number {
    for (var i = startInd; i < 7; i++) {
      if (this.getDate(i) == null) {
        return i;
      }
    }
    return -1;
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
    if (!d || (new Date(d)).getFullYear() <= 1970) {
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
    this.listCategoriesService.getAllListCategories().subscribe(lc => {
      lc.forEach(c => this.listCategories.push(c));
      if (this.currentTask != null) {
        this.currentCategory = (this.listCategories.filter(c => c.id == this.currentTask.categoryId))[0];
      }
    });
  }

  onPlaceChange(place: DefinedPlace) {
    this.editTaskForm.controls.city.setValue(place.city);
    this.editTaskForm.controls.streetAddress.setValue(place.streetAddress);
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
      date6: new Date(this.setDate('date6')),
      city: (<HTMLInputElement>document.getElementById('city')).value,
      streetAddress: (<HTMLInputElement>document.getElementById('streetAddress')).value,
      latitude: 0.0,
      longitude: 0.0
    };
  }
  
  onSubmit() {
    if (this.editTaskForm.valid) {
      var task = this.getFormValue();

      if (task.city != '' && task.city != ' ' && task.streetAddress != '' && task.streetAddress != ' ') {
        //setting task latitude and longtitude from address
        this.geocoder.geocode({ 'address': task.city }, (results, status) => {
          if (status == google.maps.GeocoderStatus.OK) {
            this.geocoder.geocode({ 'address': task.city + ',' + task.streetAddress }, (results, status) => {
              if (status == google.maps.GeocoderStatus.OK) {
                task.latitude = results[0].geometry.location.lat();
                task.longitude = results[0].geometry.location.lng();

                this.tasksService.editTask(Number(this.editedTask.id), task).subscribe(() => this.onSave.emit(task));
              }
              else {
                console.log(status);
              }
            });
          }
          else {
            console.log(status);
          }
        });
      }
      else {
        task.latitude = null;
        task.longitude = null;
        this.tasksService.editTask(Number(this.editedTask.id), task).subscribe(() => this.onSave.emit(task));
      }
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

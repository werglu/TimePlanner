import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TaskAssignmentProposition } from '../taskAssignmentProposition';
import { TaskAssignment } from '../taskAssignment';

@Component({
  selector: 'find-dates-modal',
  templateUrl: './find-dates-modal.component.html',
  styleUrls: ['./find-dates-modal.component.css']
})

export class FindDatesModalComponent implements OnInit {
  findDatesForm: FormGroup;
  public foundDatesModel: Array<TaskAssignment> = [];
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
    this.foundDates.forEach(taskAssignmentProposition => {
      var taskDayTimes: Array<boolean> = [];
      var taskInfos: Array<string> = [];
      var taskCount: number = 0;
      for (let i in [0, 1, 2, 3, 4, 5, 6]) {
        if (new Date(taskAssignmentProposition.dayTimes[i].start).getFullYear() > 1970) {
          taskDayTimes.push(true);
          var hour1 = new Date(taskAssignmentProposition.dayTimes[i].start).getHours();
          var minute1 = new Date(taskAssignmentProposition.dayTimes[i].start).getMinutes();
          var hour2 = new Date(taskAssignmentProposition.dayTimes[i].end).getHours();
          var minute2 = new Date(taskAssignmentProposition.dayTimes[i].end).getMinutes();
          taskInfos.push('Found time window ' + hour1 + ':' + (minute1 < 10 ? '0' : '') + minute1 + '-' + hour2 + ':' + (minute2 < 10 ? '0' : '') + minute2);
          taskCount += 1;
        }
        else {
          taskDayTimes.push(false);
          taskInfos.push('No time window specified')
        }
      }
      this.foundDatesModel.push({ task: taskAssignmentProposition.task, dayTimes: taskDayTimes, infos: taskInfos, count: taskCount });
    })
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

  checked(itemInd, dayInd: number) {
    for (let dataItem of this.foundDatesModel) {
      if (dataItem.task.id == itemInd) {
        dataItem.dayTimes[dayInd] = true;
        dataItem.count += 1;
        return;
      }
    }
  }

  unchecked(itemInd, dayInd: number) {
    for (let dataItem of this.foundDatesModel) {
      if (dataItem.task.id == itemInd) {
        dataItem.dayTimes[dayInd] = false;
        dataItem.count -= 1;
        return;
      }
    }
  }
}

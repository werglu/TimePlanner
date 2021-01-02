import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { TasksService } from '../tasks.service';
import { PlanningService } from '../../planning/planning.service'
import { TaskAssignmentProposition } from '../../planning/taskAssignmentProposition';
import { TaskAssignment } from '../../planning/taskAssignment';
import { TaskAssignmentSave } from '../../planning/taskAssignmentSave';

@Component({
  selector: 'find-dates-modal',
  templateUrl: './find-dates-modal.component.html',
  styleUrls: ['./find-dates-modal.component.css']
})

export class FindDatesModalComponent implements OnInit {
  public foundDatesModel: Array<TaskAssignment> = [];
  public weeks: Array<string> = [];
  currentWeek = true;
  @Input() foundDates: Array<TaskAssignmentProposition>;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<TaskAssignmentSave[]>();
  @Output() onRerun = new EventEmitter<boolean>();

  constructor(private tasksService: TasksService,
              private planningService: PlanningService) {
  }

  ngOnInit(): void {
    var endCurrent = new Date();
    endCurrent.setDate(endCurrent.getDate() + (7 - endCurrent.getDay()) % 7);
    var beginNext = new Date(endCurrent.getTime());
    beginNext.setDate(beginNext.getDate() + 1);
    var endNext = new Date(endCurrent.getTime());
    endNext.setDate(endNext.getDate() + 7);
    this.weeks = ['current (today-' + this.formatDate(endCurrent) + ')', 'next (' + this.formatDate(beginNext) + '-' + this.formatDate(endNext) + ')'];
  }

  ngOnChanges(changes: SimpleChanges) {
    this.buildFoundDatesModel();
  }

  cancel() {
    this.onCancel.emit();
  }

  getFormValue(): TaskAssignmentSave[] {
    var taskAssignmentsSave: TaskAssignmentSave[] = [];
    this.foundDatesModel.forEach(task => {
      taskAssignmentsSave.push({ taskId: task.task.id, dayTimes: task.dayTimes });
    })
    return taskAssignmentsSave;
  }
  
  onSubmit() {
    this.planningService.saveDates(this.getFormValue(), this.currentWeek).subscribe(() => this.onSave.emit(this.getFormValue()));
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

  onWeekChange(priority: string) {
    var change = false;
    if (priority == this.weeks[0]) {
      if (this.currentWeek == false) {
        change = true;
      }
      this.currentWeek = true;
    }
    else {
      if (this.currentWeek == true) {
        change = true;
      }
      this.currentWeek = false;
    }
    if (change) {
      this.foundDatesModel = [];
      this.onRerun.emit(this.currentWeek);
    }
  }

  buildFoundDatesModel() {
    var newFoundDatesModel: TaskAssignment[] = [];
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
      newFoundDatesModel.push({ task: taskAssignmentProposition.task, dayTimes: taskDayTimes, infos: taskInfos, count: taskCount });
    })
    this.foundDatesModel = newFoundDatesModel;
  }

  formatDate(date: Date): string {
    return date.getDate() + '.' + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)
  }
}

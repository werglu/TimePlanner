import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PlanningService } from '../../planning/planning.service';
import { Task } from '../../to-do-list/task';
import { FacebookService } from 'ngx-facebook';

@Component({
  selector: 'find-to-do-modal',
  templateUrl: './find-to-do-modal.component.html',
  styleUrls: ['./find-to-do-modal.component.css']
})

export class FindToDoModalComponent implements OnInit {
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter();
  userId: string;
  mySelection: number[] = [];
  public gridData: Task[] = [];

  constructor(private planningService: PlanningService,
    private fb: FacebookService) {
  }

  ngOnInit(): void {
    let authResp = this.fb.getAuthResponse();
    this.userId = authResp.userID;
    this.getTasksForToday();
  }

  cancel() {
    this.onCancel.emit();
  }
  
  onSubmit() {
    this.planningService.saveTasksForToday(this.mySelection).subscribe(() => this.onSave.emit());
  }

  getTasksForToday() {
    this.planningService.findTasksForToday().subscribe(tasks => {
      this.gridData = tasks;
    });
  }
}

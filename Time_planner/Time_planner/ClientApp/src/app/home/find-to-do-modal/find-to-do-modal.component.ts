import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PlanningService } from '../../planning/planning.service';
import { Task } from '../../to-do-list/task';

declare var FB: any;

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

  constructor(private planningService: PlanningService) {
  }

  ngOnInit(): void {
    (window as any).fbAsyncInit = () => {
      FB.init({
        appId: '343708573552335',
        cookie: true,
        xfbml: true,
        version: 'v8.0',
      });

      (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }

    FB.api('/me', (response) => {
      this.userId = response.id;
      this.getTasksForToday();
    });
  }

  cancel() {
    this.onCancel.emit();
  }
  
  onSubmit() {
    this.planningService.saveTasksForToday(this.mySelection).subscribe(() => this.onSave.emit());
  }

  getTasksForToday() {
    this.planningService.findTasksForToday(this.userId).subscribe(tasks => {
      this.gridData = tasks;
    });
  }
}

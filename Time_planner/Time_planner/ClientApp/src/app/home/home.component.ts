import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Events } from '../calendar/events';
import { EventsService } from '../calendar/events.service';
import { Subject } from 'rxjs';
import { ListCategoriesService } from '../to-do-list/listCategories.service';
import { TasksService } from '../to-do-list/tasks.service';
import { Task } from '../to-do-list/task';
import { PlanningService } from '../planning/planning.service';
import { CalendarItem } from '../planning/calendarItem';

declare var FB: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {
  lat: number = 51.678418;
  lng: number = 7.809007;
  userId: string;
  points: { lat: number, lng: number, label: string, id: number, title: string }[] = [];
  events: Events[] = [];
  userTasksCategoriesIds: number[] = [];
  tasks: Task[] = [];
  eventPoints: { lat: number, lng: number, label: string, id: number, title: string }[] = [];
  taskPoints: { lat: number, lng: number, label: string, id: number, title: string }[] = [];
  assignedPoints: { lat: number, lng: number, label: string, id: number, title: string }[] = [];

  constructor(public eventsService: EventsService,
    public planningService: PlanningService,
    public http: HttpClient,
    private listCategoriesService: ListCategoriesService,
    private tasksService: TasksService) {
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
      // get events
      this.eventsService.getAllEvents(this.userId).subscribe((events) => {
        events.forEach(e => {
          if (this.isCurrentDate(e.startDate)) {
            this.events.push(e);
          }
        });
      });

      // get tasks

      this.listCategoriesService.getAllListCategoriesPerUser(this.userId).subscribe((categories) => {
        categories.forEach(category => this.userTasksCategoriesIds.push(category.id)); // get all user's categories

        this.tasksService.getTasks().subscribe((tasks) => {
          tasks.forEach(task => {
            if (this.isCurrentDate(task.date0) || this.isCurrentDate(task.date1)
              || this.isCurrentDate(task.date2) || this.isCurrentDate(task.date3)
              || this.isCurrentDate(task.date4) || this.isCurrentDate(task.date5)
              || this.isCurrentDate(task.date6)) {
              this.tasks.push(task);
            }
          })
        });
      });

      this.getLocation();
    });
    
  }

  private isCurrentDate(startDate: Date): boolean {
    if (new Date(startDate).getDate() == new Date().getDate() &&
      new Date(startDate).getMonth() == new Date().getMonth() &&
      new Date(startDate).getFullYear() == new Date().getFullYear()) {   
      return true;
    }
    return false;
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.planningService.findPlacesOrder(this.userId).subscribe(result => {
          this.eventPoints = [];
          this.taskPoints = [];
          this.assignedPoints = [];
          result.forEach(item => {
            if (item.e) {
              this.eventPoints.push(this.getEventPoint(item.e));
            } else if (item.t && item.t.latitude && item.t.longitude) {
              this.taskPoints.push(this.getTaskPoint(item.t));
            }
            if (item.assigned) {
              this.assignedPoints.push(this.getAssignedPoint(item))
            }
          });
        })
      });
    }
    else {
      console.warn("Geolocation is not supported by this browser")
    }
  }

  getEventPoint(e: Events) {
    // todo: to be changed when there will be proper location in Event
    // only e.latitude and e.longitude should be assigned
    return {
      lat: e.latitude + this.lat,
      lng: e.longitude + this.lng,
      label: 'E' + (this.eventPoints.length + 1).toString(),
      id: e.id,
      title: e.title
    };
  }

  getTaskPoint(t: Task) {
    // todo: to be changed when there will be proper location in Task
    // only t.latitude and t.longitude should be assigned
    return {
      lat: t.latitude + this.lat,
      lng: t.longitude + this.lng,
      label: 'T' + (this.taskPoints.length + 1).toString(),
      id: t.id,
      title: t.title
    };
  }

  getAssignedPoint(i: CalendarItem) {
    // todo: to be changed when there will be proper location in Task/Event
    // only task's/event's latitude and longitude should be assigned
    if (i.e) {
      return {
        lat: i.e.latitude + this.lat,
        lng: i.e.longitude + this.lng,
        label: (this.assignedPoints.length + 1).toString(),
        id: i.e.id,
        title: i.e.title
      };
    } else if (i.t) {
      return {
        lat: i.t.latitude + this.lat,
        lng: i.t.longitude + this.lng,
        label: this.assignedPoints.length.toString(),
        id: i.t.id,
        title: i.t.title
      };
    } else {
      return null;
    }
  }
}

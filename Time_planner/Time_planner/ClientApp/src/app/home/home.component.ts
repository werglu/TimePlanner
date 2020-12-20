import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Events } from '../calendar/events';
import { EventsService } from '../calendar/events.service';
import { ListCategoriesService } from '../to-do-list/listCategories.service';
import { TasksService } from '../to-do-list/tasks.service';
import { Task } from '../to-do-list/task';
import { PlanningService } from '../planning/planning.service';
import { CalendarItem } from '../planning/calendarItem';
import { FacebookService } from 'ngx-facebook';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  lat: number = 51.678418;
  lng: number = 7.809007;
  userId: string;
  points: { lat: number, lng: number, label: string, id: number, title: string }[] = [];
  events: Events[] = [];
  userTasksCategoriesIds: number[] = [];
  tasks: Task[] = [];
  eventPoints: { lat: number, lng: number, title: string, address: string, hour: string }[] = [];
  taskPoints: { lat: number, lng: number, title: string, address: string }[] = [];
  assignedPoints: { lat: number, lng: number }[] = [];
  findToDoModalVisible: boolean = false;

  constructor(public eventsService: EventsService,
    public planningService: PlanningService,
    public http: HttpClient,
    private listCategoriesService: ListCategoriesService,
    private tasksService: TasksService,
    private fb: FacebookService) {
  }

  ngOnInit(): void {
    let authResp = this.fb.getAuthResponse();
    this.userId = authResp.userID;
    this.refresh();
    this.getLocation();  
  }

  private isCurrentDate(startDate: Date): boolean {
    if (new Date(startDate).getDate() == new Date().getDate() &&
      new Date(startDate).getMonth() == new Date().getMonth() &&
      new Date(startDate).getFullYear() == new Date().getFullYear()) {   
      return true;
    }
    return false;
  }

  private containsCurrentDate(startDate: Date, endDate: Date): boolean {
    if (new Date(startDate).getDate() <= new Date().getDate() &&
      new Date(startDate).getMonth() <= new Date().getMonth() &&
      new Date(startDate).getFullYear() <= new Date().getFullYear() &&
      new Date(endDate).getDate() >= new Date().getDate() &&
      new Date(endDate).getMonth() >= new Date().getMonth() &&
      new Date(endDate).getFullYear() >= new Date().getFullYear()) {
      return true;
    }
    return false;
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
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
      title: e.title,
      address: e.streetAddress,
      hour: new Date(e.startDate).getHours() + ":" + (new Date(e.startDate).getMinutes() < 10 ? '0' : '') + new Date(e.startDate).getMinutes() + ' - ' +
        new Date(e.endDate).getHours() + ":" + (new Date(e.endDate).getMinutes() < 10 ? '0' : '') + new Date(e.endDate).getMinutes()
    };
  }

  getTaskPoint(t: Task) {
    // todo: to be changed when there will be proper location in Task
    // only t.latitude and t.longitude should be assigned
    return {
      lat: t.latitude + this.lat,
      lng: t.longitude + this.lng,
      title: t.title,
      address: t.streetAddress ? t.streetAddress : '???'
    };
  }

  getAssignedPoint(i: CalendarItem) {
    // todo: to be changed when there will be proper location in Task/Event
    // only task's/event's latitude and longitude should be assigned
    if (i.e) {
      return {
        lat: i.e.latitude + this.lat,
        lng: i.e.longitude + this.lng
      };
    } else if (i.t) {
      return {
        lat: i.t.latitude + this.lat,
        lng: i.t.longitude + this.lng
      };
    } else {
      return null;
    }
  }

  showFindToDoModal() {
    this.findToDoModalVisible = true;
  }

  closeFindToDoModal() {
    this.findToDoModalVisible = false;
  }

  saveTasksForToday() {
    this.closeFindToDoModal();
    this.refresh();
  }

  refresh() {
    // get events
    this.eventsService.getAllEvents(this.userId).subscribe((events) => {
      this.events = [];
      events.forEach(e => {
        if (this.containsCurrentDate(e.startDate, e.endDate)) {
          this.events.push(e);
        }
      });
    });

    // get tasks
    this.listCategoriesService.getAllListCategories().subscribe((categories) => {
      categories.forEach(category => this.userTasksCategoriesIds.push(category.id)); // get all user's categories

      this.tasksService.getTasks().subscribe((tasks) => {
        this.tasks = [];
        tasks.forEach(task => {
          if (this.userTasksCategoriesIds.indexOf(task.categoryId) >=0 && (
            this.isCurrentDate(task.date0) || this.isCurrentDate(task.date1)
            || this.isCurrentDate(task.date2) || this.isCurrentDate(task.date3)
            || this.isCurrentDate(task.date4) || this.isCurrentDate(task.date5)
            || this.isCurrentDate(task.date6))) {
            this.tasks.push(task);
          }
        })
      });
    });

    this.planningService.findPlacesOrder().subscribe(result => {
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
  }
}

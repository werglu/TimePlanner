import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Events } from '../calendar/events';
import { EventsService } from '../calendar/events.service';
import { Subject } from 'rxjs';
import { ListCategoriesService } from '../to-do-list/listCategories.service';
import { TasksService } from '../to-do-list/tasks.service';
import { Task } from '../to-do-list/task';

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

  constructor(public eventsService: EventsService,
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


  ngAfterViewInit(): void {
    this.getLocation();
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        //this.eventsService.getSortedEvents().subscribe(e => {
        //  var ind = 1;
        //  e.forEach(ee => {
        //    // todo: to be changed when there will be proper location in Event
        //    // only ee.latitude and ee.longitude should be assigned
        //    this.points.push({
        //      lat: ee.latitude + this.lat,
        //      lng: ee.longitude + this.lng,
        //      label: ind.toString(),
        //      id: ee.id,
        //      title: ee.title
        //    })
        //    ind++;
        //  });
        //});
      });
    }
    else {
      console.warn("Geolocation is not supported by this browser")
    }
  }
}

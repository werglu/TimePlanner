import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarEventAction } from 'angular-calendar';
import { EventsService } from './events.service';
import { Events } from './events';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { isSameDay, isSameMonth } from 'date-fns';
import { TasksService } from '../to-do-list/tasks.service';
import { Task } from '../to-do-list/task';

declare var FB: any;

@Component({
  selector: 'app-calendar-component',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})

export class CalendarComponent implements OnInit, AfterViewInit {
  monthView = true;
  dayView = false;
  weekView = false;
  openEvent = false;
  openTask = false;
  isPublic = false;
  editedEvent: CalendarEvent;
  addNewEventModalVisible = false;
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  activeDayIsOpen = false;
  CalendarView = CalendarView;
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [];
  actions: CalendarEventAction[] = [
    {
      label: '<i style="color:#f8b400;" class="fa fa-trash"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.deleteEvent(event);
      },
    },
  ];
  userId: string;

  constructor(public eventsService: EventsService,
    public tasksService: TasksService,
    public http: HttpClient) {
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
      this.getTasks();
      this.getEvents();
    });
  }

  ngAfterViewInit(): void {
  }

  getEvents(): void {
    this.eventsService.getAllEvents(this.userId).subscribe(e => {
      e.forEach(ee => {
          this.events.push({
            id: ee.id,
            title: ee.title,
            start: new Date(ee.startDate),
            end: new Date(ee.endDate),
            actions: this.actions,
            color: {
              primary: '#ff9642',
              secondary: '#ff9642'
            },
            meta: {
              type: 'event'
            }
          })
      });
      this.refresh.next();
    });
  }

  getTasks() {
    this.tasksService.getTasks().subscribe(t => {
      t.forEach(task => {
        if (task.startDate != null) {
          this.events.push({
            id: task.id,
            title: task.title,
            start: new Date(task.startDate),
            end: new Date(task.endDate),
            actions: this.actions,
            color: {
              primary: '#2c786c',
              secondary: '#ff9642'
            },
            meta: {
              type: 'task'
            }
          })
        }
      })
      this.refresh.next();
    });
  }

  eventClicked(event: CalendarEvent): void {
    this.editedEvent = event;
    if (event.meta.type == 'event') { this.openEvent = true; }
    if (event.meta.type == 'task') { this.openTask = true; }
  }

  closeOpenEventModal() {
    this.openEvent = false;
  }

  closeOpenTaskModal() {
    this.openTask = false;
  }

  getWeekView() {
    this.view = CalendarView.Week;
    this.weekView = true;
    this.dayView = false;
    this.monthView = false;
  }

  getMonthView() {
    this.view = CalendarView.Month;
    this.monthView = true;
    this.dayView = false;
    this.weekView = false;
  }

  getDayView() {
    this.view = CalendarView.Day;
    this.dayView = true;
    this.weekView = false;
    this.monthView = false;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }) {
    if (isSameMonth(date, this.viewDate)) {
      if ( events.length == 0 || (isSameDay(this.viewDate, date) && this.activeDayIsOpen == true) ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  editEvent(event: Events) {
    this.closeOpenEventModal();
    this.events = this.events.filter(e => e.id !== event.id);
    this.events.push({
      id: event.id,
      start: event.startDate,
      end: event.endDate,
      title: event.title,
      actions: this.actions,
      color: {
        primary: '#ff9642',
        secondary: '#ff9642'
      },
      meta: {
        type: 'event'
      }
    });
    this.activeDayIsOpen = false;
    this.refresh.next();
  }

  editTask(task: Task) {
    this.closeOpenTaskModal();
    this.events = this.events.filter(e => e.id !== task.id);
    if (!task.isDone) {
      this.events.push({
        id: task.id,
        title: task.title,
        start: new Date(task.startDate),
        end: new Date(task.endDate),
        actions: this.actions,
        color: {
          primary: '#2c786c',
          secondary: '#ff9642'
        },
        meta: {
          type: 'task'
        }
      });
    }
    this.activeDayIsOpen = false;
    this.refresh.next();
  }

  addEvent(event: Events) {
    this.closeAddNewEventModal();
    this.events = [];
    this.getTasks();
    this.getEvents();
    this.activeDayIsOpen = false;
    this.refresh.next();
  }

  openAddNewEventModal() {
    this.isPublic = false;
    this.addNewEventModalVisible = true;
  }

  closeAddNewEventModal() {
    this.addNewEventModalVisible = false;
  }

  deleteEvent(event: CalendarEvent) {
    this.eventsService.deleteEvent(+event.id).subscribe(response => {
      this.closeOpenEventModal();
      this.events = this.events.filter(e => e.id !== event.id);
      this.activeDayIsOpen = false;
      this.refresh.next();
    });
  }

  eventVisibilityChanged(event: boolean) {
    this.isPublic = event;
  }
}

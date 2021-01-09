import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { EventsService } from './events.service';
import { Events } from './events';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { isSameDay, isSameMonth } from 'date-fns';
import { TasksService } from '../to-do-list/tasks.service';
import { Task } from '../to-do-list/task';
import { NotificationsService } from '../notifications/notifications.service';
import { ListCategoriesService } from '../to-do-list/listCategories.service';
import { isNullOrUndefined } from 'util';
import { FacebookService } from 'ngx-facebook';
import { UserEventsService } from './userEvents.service';
import { UserService } from '../user/user.service';

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
  openFbEvent = false;
  openFbBirthday = false;
  openTask = false;
  isPublic = false;
  canEditEvent = true;
  editedEvent: CalendarEvent;
  addNewEventModalVisible = false;
  openAttendedEvent = false;
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  activeDayIsOpen = false;
  CalendarView = CalendarView;
  refresh: Subject<any> = new Subject();
  userTasksCateoriesIds: number[] = [];
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
  fbEvents: CalendarEvent[] = [];
  fbBirthdayEvents: CalendarEvent[] = [];
  userId: string;

  constructor(public eventsService: EventsService,
    public tasksService: TasksService,
    public http: HttpClient,
    private listCategoriesService: ListCategoriesService,
    private notificationsService: NotificationsService,
    private userEventsService: UserEventsService,
    private fb: FacebookService) {
  }

  ngOnInit(): void {

    let authResp = this.fb.getAuthResponse();
    this.userId = authResp.userID;
    this.getTasks();
    this.getEvents();
    this.getFbEvents();
    this.getFbBirthday();
  }

  ngAfterViewInit(): void {
  }

  getEvents(): void {
    this.eventsService.getAllEvents(this.userId).subscribe(e => {
      e.forEach(ee => {
        this.events.push({
          id: ee.id,
          title: ee.title,
          description: '',
          start: new Date(ee.startDate),
          end: new Date(ee.endDate),
          actions: this.actions,
          draggable: true,
          color: {
            primary: '#ff9642',
            secondary: '#ff9642'
          },
          meta: {
            type: 'event'
          }
        } as CalendarEvent)
      });


      this.userEventsService.getAllUserEvents(this.userId).subscribe((userEvents) => {
        userEvents.forEach((userEvent) => {
          if (userEvent.status === 1) { //if accepted than add to the calendar
            this.eventsService.getEvent(userEvent.eventId).subscribe((event) => {
              this.events.push({
                id: event.id,
                title: event.title,
                description: '',
                start: new Date(event.startDate),
                end: new Date(event.endDate),
                draggable: false,
                color: {
                  primary: '#aa8976',
                  secondary: '#aa8976'
                },
                meta: {
                  type: 'eventAttended'
                }
              });
              this.refresh.next();
            });

          }               
        });
      });

      this.refresh.next();

    });
  }

  getTasks() {
    this.listCategoriesService.getAllListCategories().subscribe((categories) => {
      categories.forEach(category => this.userTasksCateoriesIds.push(category.id));
      // get all tasks specified per user
      this.tasksService.getTasks().subscribe(tasks => {
        tasks.forEach(task => {
          // get only tasks per current user - need to filter by categories
          if (!isNullOrUndefined(this.userTasksCateoriesIds.find(categoryId => categoryId == task.categoryId))) {
            for (var date of [task.date0, task.date1, task.date2, task.date3, task.date4, task.date5, task.date6]) {
              if (date != null) {
                this.events.push({
                  id: task.id,
                  title: task.title,
                  description: '',
                  start: new Date(new Date(date).setHours(0, 0)),
                  end: new Date(new Date(date).setHours(0, 30)),
                  actions: this.actions,
                  draggable: true,
                  color: {
                    primary: '#2c786c',
                    secondary: '#2c786c'
                  },
                  meta: {
                    type: 'task'
                  }
                } as CalendarEvent)
              }
            }
          }
        })
        this.refresh.next();
      });
    });
  }

  getFbEvents() {
    this.fb.api("/me/events", "get").then(
      response => {
        response.data.forEach((x) => {
          let ev: CalendarEvent = {
            id: x.id + "f",
            start: new Date(x.start_time),
            title: x.name,
            description: x.description,
            color: {
              primary: '#3b5998',
              secondary: '#3b5998'
            },
            allDay: false,
            draggable: false,
            meta: {
              type: 'fbEvent'
            }
          } as CalendarEvent
          if (x.end_time == null)
            ev.end = new Date(x.start_time);
          else
            ev.end = new Date(x.end_time);

          if (x.hasOwnProperty('place'))
            ev.place = x.place.name;
          this.fbEvents.push(ev);
        });

        this.addFbEvents();
      });
  }

  getFbBirthday() {
    this.fb.api('/me/friends', 'get', { fields: 'name,birthday' }).then(
      response => {
        response.data.forEach((x) => {
          if (x.hasOwnProperty('birthday')) {
            let name = x.name.split(" ");
            let birthday = x.birthday.split("/");
            let ev: CalendarEvent = {
              id: "birthdayf",
              title: name[0] + " birthday!",
              description: x.name + " has a birthday today",
              start: new Date(birthday[0] + '/' + birthday[1] + '/' + new Date().getFullYear()),
              color: {
                primary: '#FF0000',
                secondary: '#FF0000',
              },
              allDay: true,
              draggable: false,
              meta: {
                type: 'fbBirthday'
              }
            } as CalendarEvent

            this.fbBirthdayEvents.push(ev);
          }
          
        });
        this.addFbBirthdatEvents();
      });
  }

  addFbEvents() {
    this.fbEvents.forEach((x) => {
      this.events.push(x);
    })
  }

  addFbBirthdatEvents() {
    this.fbBirthdayEvents.forEach((x) => {
      this.events.push(x);
    })
  }

  eventClicked(event: CalendarEvent): void {
    this.editedEvent = event;
    if (event.meta.type == 'eventAttended') { this.openAttendedEvent = true;}
    if (event.meta.type == 'event') { this.openEvent = true; }
    if (event.meta.type == 'fbEvent') { this.openFbEvent = true; }
    if (event.meta.type == 'fbBirthday') { this.openFbBirthday = true; }
    if (event.meta.type == 'task') { this.openTask = true; }
  }

  closeOpenEventModal() {
    this.openEvent = false;
  }

  closeOpenFbEventModal() {
    this.openFbEvent = false;
  }

  closeOpenFbBirthdayModal() {
    this.openFbBirthday = false;
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
      if (events.length == 0 || (isSameDay(this.viewDate, date) && this.activeDayIsOpen == true)) {
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
      description: '',
      actions: this.actions,
      draggable: true,
      color: {
        primary: '#ff9642',
        secondary: '#ff9642'
      },
      meta: {
        type: 'event'
      }
    } as CalendarEvent);
    this.activeDayIsOpen = false;
    this.refresh.next();
  }

  editTask(task: Task) {
    this.closeOpenTaskModal();
    this.events = this.events.filter(e => e.id !== task.id);
    if (!task.isDone) {
      for (var date of [task.date0, task.date1, task.date2, task.date3, task.date4, task.date5, task.date6]) {
        if (date != null) {
          this.events.push({
            id: task.id,
            title: task.title,
            description: '',
            start: new Date(date),
            end: new Date(date),
            actions: this.actions,
            draggable: true,
            color: {
              primary: '#2c786c',
              secondary: '#ff9642'
            },
            meta: {
              type: 'task'
            }
          } as CalendarEvent);
        }
      }
    }
    this.activeDayIsOpen = false;
    this.refresh.next();
  }

  addEvent(event: Events) {
    this.closeAddNewEventModal();
    this.events = [];
    this.getTasks();
    this.getEvents();
    this.addFbEvents();
    this.addFbBirthdatEvents();
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

  areDatesEqual(date1: Date, date2: Date) {
    var d1 = new Date(date1).toLocaleDateString();
    var d2 = date2.toLocaleDateString();
    return d1 == d2;
  }

  async deleteEvent(event: CalendarEvent) {
    if (event.meta.type == 'task') {
      this.tasksService.getTask(+event.id).subscribe((task) => {
        if (this.areDatesEqual(task.date0, event.start)) {
          task.date0 = null;
        }
        else if (this.areDatesEqual(task.date1, new Date(event.start))) {
          task.date1 = null;
        }
        else if (this.areDatesEqual(task.date2, event.start)) {
          task.date2 = null;
        }
        else if (this.areDatesEqual(task.date3, event.start)) {
          task.date3 = null;
        }
        else if (this.areDatesEqual(task.date4, event.start)) {
          task.date4 = null;
        }
        else if (this.areDatesEqual(task.date5, event.start)) {
          task.date5 = null;
        }
        else if (this.areDatesEqual(task.date6, event.start)) {
          task.date6 = null;
        }
        this.tasksService.editTask(+event.id, task).subscribe(() => {
          this.closeOpenEventModal();
          this.events = this.events.filter(e => e.meta.type !== 'task');
          this.getTasks();
          this.refresh.next();
          this.activeDayIsOpen = false;
        });
      });
    }
    else {
      this.eventsService.deleteEvent(+event.id).subscribe(response => {
        this.closeOpenEventModal();
        this.events = this.events.filter(e => e.id !== event.id);
        this.activeDayIsOpen = false;
        this.refresh.next();
      });
    }
  }

  removeAttendedEvent() {
    this.closeOpenAttendedEventModal();
    this.events = this.events.filter(e => e.id != this.editedEvent.id);
    this.refresh.next();
  }

  closeOpenAttendedEventModal() {
    this.openAttendedEvent = false;
  }

  eventVisibilityChanged(event: boolean) {
    this.isPublic = event;
  }

  // dragg and drop event change it's start and end dates
  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    if (event.meta.type == 'task') {
      this.tasksService.getTask(+event.id).subscribe((task) => {
        if (this.areDatesEqual(task.date0, event.start)) {
          task.date0 = new Date(newStart);
        }
        else if (this.areDatesEqual(task.date1, event.start)) {
          task.date1 = new Date(newStart);
        }
        else if (this.areDatesEqual(task.date2, event.start)) {
          task.date2 = new Date(newStart);
        }
        else if (this.areDatesEqual(task.date3, event.start)) {
          task.date3 = new Date(newStart);
        }
        else if (this.areDatesEqual(task.date4, event.start)) {
          task.date4 = new Date(newStart);
        }
        else if (this.areDatesEqual(task.date5, event.start)) {
          task.date5 = new Date(newStart);
        }
        else if (this.areDatesEqual(task.date6, event.start)) {
          task.date6 = new Date(newStart);
        }
        this.tasksService.editTask(+event.id, task).subscribe(() => {
          this.editTask(task);
        });
      });
    }
    else {
      this.eventsService.getEvent(Number(event.id)).subscribe((e) => {
        e.startDate = new Date(newStart);
        e.endDate = new Date(newEnd);
        this.eventsService.editEvent(+event.id, e).subscribe(() => {
          this.events = this.events.filter(e => e.id !== event.id);
          this.events.push({
            id: event.id,
            start: newStart,
            end: newEnd,
            title: event.title,
            description: '',
            actions: this.actions,
            draggable: true,
            color: {
              primary: '#ff9642',
              secondary: '#ff9642'
            },
            meta: {
              type: 'event'
            }
          } as CalendarEvent);
          this.refresh.next();
        });
      });
    }

  }

}

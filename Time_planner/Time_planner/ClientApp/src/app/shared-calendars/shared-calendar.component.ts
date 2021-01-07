import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarEventAction } from 'angular-calendar';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { isSameDay, isSameMonth } from 'date-fns';
import { FacebookService } from 'ngx-facebook';
import { EventsService } from '../calendar/events.service';
import { Events } from '../calendar/events';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { Friend } from '../shared/friend';
import { UserEventsService } from '../calendar/userEvents.service';

@Component({
  selector: 'app-shared-calendar-component',
  templateUrl: './shared-calendar.component.html',
  styleUrls: ['./shared-calendar.component.css']
})

export class SharedCalendarComponent implements OnInit {
  monthView = true;
  dayView = false;
  weekView = false;
  openEvent = false;
  editedEvent: CalendarEvent;
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  activeDayIsOpen = false;
  CalendarView = CalendarView;
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [];
  actions: CalendarEventAction[] = [];
  userId: string;
  friendId: string;
  allFriends: Friend[] = [];
  access: boolean = false;
  friendName: string;
  friendPicture: any;

  constructor(public eventsService: EventsService,
    public http: HttpClient,
    private fb: FacebookService,
    private route: ActivatedRoute,
    private router: Router,
    private userEventsService: UserEventsService,
    private userService: UserService) {
  }

  ngOnInit(): void {

    let authResp = this.fb.getAuthResponse();
    this.userId = authResp.userID;
    this.friendId = this.route.snapshot.paramMap.get('id');

    this.fb.api('/me/friends', 'get', { fields: 'id,name,picture.type(normal)' }).then((res) => {
      // this is to prevent from hack attack, user can access only their friends calendars
      res.data.forEach(d => {
        if (d.id == this.friendId) {
          this.access = true;
          this.friendName = d.name;
          this.friendPicture = d.picture.data.url;
        }
      });
      if (!this.access) {
        // after 3 seconds it will renavigate to the home page
        this.router.navigate(['/cannot-access']);
      }
    });
   
    this.getEvents();
  }

  getEvents(): void {
    this.eventsService.getAllEvents(this.friendId).subscribe(e => {
      e.forEach(ee => {
        if (ee.isPublic) {
          this.events.push({
            id: ee.id,
            title: ee.title,
            description: '',
            start: new Date(ee.startDate),
            end: new Date(ee.endDate),
            actions: this.actions,
            color: {
              primary: '#ff9642',
              secondary: '#ff9642'
            },
            meta: {
              type: 'public'
            }
          })
        }
        else {
          this.events.push({
            id: ee.id,
            title: 'Private appointment',
            description: '',
            start: new Date(ee.startDate),
            end: new Date(ee.endDate),
            color: {
              primary: '#2c786c',
              secondary: '#2c786c'
            },
            meta: {
              type: 'private'
            }
          })
        }
      });
      this.refresh.next();
    });


    this.userEventsService.getAllUserEvents(this.friendId).subscribe((userEvents) => {
      userEvents.forEach((userEvent) => {
        if (userEvent.status === 1) { //if accepted than add to the calendar
          this.eventsService.getEvent(userEvent.eventId).subscribe((event) => {
            if (event.isPublic) {
              this.events.push({
                id: event.id,
                title: event.title,
                start: new Date(event.startDate),
                end: new Date(event.endDate),
                draggable: false,
                color: {
                  primary: '#ff9642',
                  secondary: '#ff9642'
                },
                meta: {
                  type: 'public'
                }
              });
            }
            else {
                this.events.push({
                  id: event.id,
                  title: 'Private appointment',
                  start: new Date(event.startDate),
                  end: new Date(event.endDate),
                  draggable: false,
                  color: {
                    primary: '#2c786c',
                    secondary: '#2c786c'
                  },
                  meta: {
                    type: 'private'
                  }
                });
            }

            this.refresh.next();

            });
        }
      });
    });
  }

  eventClicked(event: CalendarEvent): void {
    this.editedEvent = event;
    this.openEvent = true; 
  }

  closeOpenEventModal() {
    this.openEvent = false;
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
    this.activeDayIsOpen = false;
    this.refresh.next();
  }
}

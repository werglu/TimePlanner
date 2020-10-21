import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarMonthViewBeforeRenderEvent, CalendarEventAction } from 'angular-calendar';
import { EventsService } from './events.service';
import { Events } from './events';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { isSameDay, isSameMonth } from 'date-fns';

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
      label: '<i class="fa fa-trash"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.deleteEvent(event);
      },
    },
  ];

  constructor(public eventsService: EventsService,
  public http: HttpClient) {
  }

  ngOnInit(): void {
    this.getEvents();
  }

  ngAfterViewInit(): void {
  }

  getEvents(): void {
    this.eventsService.getAllEvents().subscribe(e => {
      e.forEach(ee => {
        this.events.push({
          id: ee.id,
          title: ee.title,
          start: new Date(ee.startDate),
          end: new Date(ee.endDate),
          actions: this.actions,
        })
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
    });
    this.activeDayIsOpen = false;
    this.refresh.next();
  }

  addEvent(event: Events) {
    this.closeAddNewEventModal();
    this.events = [];
    this.getEvents();
    this.activeDayIsOpen = false;
    this.refresh.next();
  }

  openAddNewEventModal() {
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
}

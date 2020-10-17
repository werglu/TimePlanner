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
      onClick: ({ event }: { event: CalendarEvent }): void => { },
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
          title: ee.title,
          start: new Date(ee.startDate),
          end: new Date(ee.endDate),
          actions: this.actions,
        })
      });
      this.refresh.next();
    });

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


}

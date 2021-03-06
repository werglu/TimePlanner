import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskAssignmentProposition } from './taskAssignmentProposition';
import { TaskAssignmentSave } from './taskAssignmentSave';
import { CalendarItem } from './calendarItem';
import { Task } from '../to-do-list/task';
import { CommonDateOutput } from './commonDateOutput';

@Injectable({
  providedIn: 'root',
})

export class PlanningService {
  baseUrl: string;

  constructor(public http: HttpClient) {
    this.baseUrl = environment.apiBaseUrl + 'api/Planning/';
  }

  findDates(ids: number[], currentWeek: boolean): Observable<TaskAssignmentProposition[]> {
    var date = new Date();
    return this.http.put<TaskAssignmentProposition[]>(this.baseUrl + 'weekplan?currentWeek=' + currentWeek + '&year=' + date.getFullYear() + '&month=' + (date.getMonth() + 1) + '&day=' + date.getDate(), ids);
  }

  saveDates(taskAssignemntsSave: TaskAssignmentSave[], currentWeek: boolean): Observable<TaskAssignmentSave[]> {
    var date = new Date();
    return this.http.put<TaskAssignmentSave[]>(this.baseUrl + 'saveDates?currentWeek=' + currentWeek + '&year=' + date.getFullYear() + '&month=' + (date.getMonth() + 1) + '&day=' + date.getDate(), taskAssignemntsSave);
  }

  findPlacesOrder(): Observable<CalendarItem[]> {
    var date = new Date();
    return this.http.get<CalendarItem[]>(this.baseUrl + 'dayplan?year=' + date.getFullYear() + '&month=' + (date.getMonth() + 1) + '&day=' + date.getDate());
  }

  findTasksForToday(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl + 'tasksForToday');
  }

  saveTasksForToday(taskIds: number[]): Observable<number[]> {
    var date = new Date();
    return this.http.put<number[]>(this.baseUrl + 'tasksForToday?year=' + date.getFullYear() + '&month=' + (date.getMonth() + 1) + '&day=' + date.getDate(), taskIds);
  }

  findCommonDate(userIds: string[], start: Date, end: Date, excludeEventId: number): Observable<CommonDateOutput> {
    return this.http.put<CommonDateOutput>(this.baseUrl + 'commonDate', {
      userIds: userIds,
      start: start,
      end: end,
      excludeEventId: excludeEventId
    });
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskAssignmentProposition } from './taskAssignmentProposition';
import { TaskAssignmentSave } from './taskAssignmentSave';
import { CalendarItem } from './calendarItem';
import { Task } from '../to-do-list/task';

@Injectable({
  providedIn: 'root',
})

export class PlanningService {
  baseUrl: string;

  constructor(public http: HttpClient) {
    this.baseUrl = environment.apiBaseUrl + 'api/Planning/';
  }

  findDates(ids: number[], userId): Observable<TaskAssignmentProposition[]> {
    var date = new Date();
    return this.http.put<TaskAssignmentProposition[]>(this.baseUrl + 'weekplan?userId=' + userId + '&year=' + date.getFullYear() + '&month=' + (date.getMonth() + 1) + '&day=' + date.getDate(), ids);
  }

  saveDates(taskAssignemntsSave: TaskAssignmentSave[]): Observable<TaskAssignmentSave[]> {
    var date = new Date();
    return this.http.put<TaskAssignmentSave[]>(this.baseUrl + 'saveDates?year=' + date.getFullYear() + '&month=' + (date.getMonth() + 1) + '&day=' + date.getDate(), taskAssignemntsSave);
  }

  findPlacesOrder(userId: string): Observable<CalendarItem[]> {
    var date = new Date();
    return this.http.get<CalendarItem[]>(this.baseUrl + 'dayplan?userId=' + userId + '&year=' + date.getFullYear() + '&month=' + (date.getMonth() + 1) + '&day=' + date.getDate());
  }

  findTasksForToday(userId: string): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl + 'tasksForToday?userId=' + userId);
  }

  saveTasksForToday(taskIds: number[]): Observable<number[]> {
    var date = new Date();
    return this.http.put<number[]>(this.baseUrl + 'tasksForToday?year=' + date.getFullYear() + '&month=' + (date.getMonth() + 1) + '&day=' + date.getDate(), taskIds);
  }
}

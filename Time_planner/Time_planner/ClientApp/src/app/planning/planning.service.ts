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

  findDates(ids: number[]): Observable<TaskAssignmentProposition[]> {
    return this.http.put<TaskAssignmentProposition[]>(this.baseUrl + 'weekplan/', ids);
  }

  saveDates(taskAssignemntsSave: TaskAssignmentSave[]): Observable<TaskAssignmentSave[]> {
    return this.http.put<TaskAssignmentSave[]>(this.baseUrl + 'saveDates', taskAssignemntsSave);
  }

  findPlacesOrder(userId: string): Observable<CalendarItem[]> {
    return this.http.get<CalendarItem[]>(this.baseUrl + 'dayplan/' + userId);
  }

  findTasksForToday(userId: string): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl + 'tasksForToday/' + userId);
  }

  saveTasksForToday(taskIds: number[]): Observable<number[]> {
    return this.http.put<number[]>(this.baseUrl + 'tasksForToday/', taskIds);
  }
}

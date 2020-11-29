import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskAssignmentProposition } from './taskAssignmentProposition';
import { TaskAssignmentSave } from './taskAssignmentSave';

@Injectable({
  providedIn: 'root',
})

export class PlanningService {

  constructor(public http: HttpClient) {
  }

  findDates(ids: number[]): Observable<TaskAssignmentProposition[]> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.put<TaskAssignmentProposition[]>(baseUrl + 'api/Planning/weekplan/', ids);
  }

  saveDates(taskAssignemntsSave: TaskAssignmentSave[]): Observable<TaskAssignmentSave[]> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.put<TaskAssignmentSave[]>(baseUrl + 'api/Planning/saveDates', taskAssignemntsSave);
  }
}

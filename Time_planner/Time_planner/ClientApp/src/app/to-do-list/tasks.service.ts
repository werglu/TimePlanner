import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from './task';

@Injectable({
  providedIn: 'root',
})

export class TasksService {

  constructor(public http: HttpClient) {
  }

  getTasks(): Observable<Task[]> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.get<Task[]>(baseUrl + 'api/Tasks');
  }

  editTask(id: number, task: Task): Observable<Task> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.put<Task>(baseUrl + 'api/Tasks/' + id.toString(), task);
  }

  addTask(task: Task): Observable<Task> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.post<Task>(baseUrl + 'api/Tasks/', task);
  }

  deleteTask(id: number): Observable<Task> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.delete<Task>(baseUrl + 'api/Tasks/' + id.toString());
  }
}

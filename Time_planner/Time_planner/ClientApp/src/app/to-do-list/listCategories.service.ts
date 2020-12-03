import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListCategory } from './listCategory';

@Injectable({
  providedIn: 'root',
})
export class ListCategoriesService {

  constructor(public http: HttpClient) {
  }

  getAllListCategories(): Observable<ListCategory[]> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.get<ListCategory[]>(baseUrl + 'api/ListCategories');
  }

  getAllListCategoriesPerUser(userId: string): Observable<ListCategory[]> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.get<ListCategory[]>(baseUrl + 'api/ListCategories/perUser/' + userId);
  }

  public addCategory(category: ListCategory): Observable<ListCategory> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.post<ListCategory>(baseUrl + 'api/ListCategories/', category);
  }

}

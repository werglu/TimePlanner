import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent {
  public forecasts: Events[];

  constructor(http: HttpClient) {
    var baseUrl: string = environment.apiBaseUrl;
    http.get<Events[]>(baseUrl + 'api/Events').subscribe(result => {
      this.forecasts = result;
    }, error => console.error(error));
  }
}

interface Events {
  id: number;
  startDate: Date;
  endDate: Date;
  title: string;
}

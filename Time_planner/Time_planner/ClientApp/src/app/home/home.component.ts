import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Events } from '../calendar/events';
import { EventsService } from '../calendar/events.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit {
  lat: number = 51.678418;
  lng: number = 7.809007;
  points: { lat: number, lng: number, label: string, id: number, title: string }[] = [];

  constructor(public eventsService: EventsService,
    public http: HttpClient) {
  }

  ngAfterViewInit(): void {
    this.getLocation();
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.eventsService.getSortedEvents().subscribe(e => {
          var ind = 1;
          e.forEach(ee => {
            // todo: to be changed when there will be proper location in Event
            // only ee.latitude and ee.longitude should be assigned
            this.points.push({
              lat: ee.latitude + this.lat,
              lng: ee.longitude + this.lng,
              label: ind.toString(),
              id: ee.id,
              title: ee.title
            })
            ind++;
          });
        });
      });
    }
    else {
      console.warn("Geolocation is not supported by this browser")
    }
  }
}

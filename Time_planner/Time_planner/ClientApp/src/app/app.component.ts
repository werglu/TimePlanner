import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements AfterViewInit {
  title = 'app';
  lat: number = 51.678418;
  lng: number = 7.809007;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.getLocation();
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => { this.lat = position.coords.latitude; this.lng = position.coords.longitude; });
    }
    else { // "Geolocation is not supported by this browser."
    }
  }
}

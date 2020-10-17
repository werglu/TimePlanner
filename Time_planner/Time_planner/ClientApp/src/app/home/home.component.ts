import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit {
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

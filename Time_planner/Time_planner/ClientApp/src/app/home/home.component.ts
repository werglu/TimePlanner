import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit {
  lat: number = 51.678418;
  lng: number = 7.809007;
  paths: { lat: number, lng: number } [] = [];

  constructor() {
  }

  ngAfterViewInit(): void {
    this.getLocation();
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.paths = [
          { lat: this.lat, lng: this.lng },
          { lat: this.lat + 0.02, lng: this.lng + 0.02 },
          { lat: this.lat + 0.01, lng: this.lng + 0.03 },
          { lat: this.lat - 0.01, lng: this.lng + 0.01 },
        ];
      });
    }
    else {
      console.warn("Geolocation is not supported by this browser")
    }
  }
}

import { Component, OnInit } from "@angular/core";
import { DefinedPlacesService } from "./defined-places.service";
import { FacebookService } from "ngx-facebook";

@Component({
  templateUrl: './defined-places.component.html',
  styleUrls: ['./defined-places.component.css']
})

export class DefinedPlacesComponent implements OnInit {

  userId: string;
  gridData: any[] = [];
  addNewPlaceModalVisible: boolean = false;

  constructor(private fb: FacebookService,
    private definedPlacesService: DefinedPlacesService) {
  }

  ngOnInit(): void {
    let authResp = this.fb.getAuthResponse();
    this.userId = authResp.userID;

    this.getPlaces();
  }

  getPlaces() {
    this.definedPlacesService.getAllPlaces().subscribe((places) => {
      this.gridData = places;
    });
  }

  removePlace(placeId: number) {
    this.definedPlacesService.deletePlace(placeId).subscribe((place) => {
      this.gridData.splice(this.gridData.indexOf(place), 1);
    });
  }

  openAddPlaceModal() {
    this.addNewPlaceModalVisible = true;
  }

  closeAddPlaceModal() {
    this.addNewPlaceModalVisible = false;
  }

  addPlace(place: any) {
    this.closeAddPlaceModal();
    this.getPlaces();
  }
}

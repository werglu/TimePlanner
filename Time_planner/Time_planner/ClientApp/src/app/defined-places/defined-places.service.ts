import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DefinedPlace } from "./defined-place";
import { environment } from "../../environments/environment.prod";

@Injectable({
  providedIn: 'root',
})
export class DefinedPlacesService {

  constructor(public http: HttpClient) {
  }

  getAllPlaces(userId: string): Observable<DefinedPlace[]> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.get<DefinedPlace[]>(baseUrl + 'api/Places/' + userId);
  }

  deletePlace(id: number): Observable<DefinedPlace> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.delete<DefinedPlace>(baseUrl + 'api/Places/' + id.toString());
  }

  public addPlace(definedPlace: DefinedPlace): Observable<DefinedPlace> {
    var baseUrl: string = environment.apiBaseUrl;
    return this.http.post<DefinedPlace>(baseUrl + 'api/Places/', definedPlace);
  }
}

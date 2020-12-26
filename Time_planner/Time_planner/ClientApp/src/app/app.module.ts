import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import { AgmCoreModule } from '@agm/core';
//import { AgmDirectionModule } from 'agm-direction';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { EditEventModalComponent } from './calendar/edit-event-modal/edit-event-modal.component';
import { AddEventModalComponent } from './calendar/add-event-modal/add-event-modal.component';
import { ToDoListComponent } from './to-do-list/to-do-list.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { AddNewCategoryModalComponent } from './to-do-list/add-new-category-modal/add-new-category-modal.component';
import { AddNewTaskModalComponent } from './to-do-list/add-new-task-modal/add-new-task-modal.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationDetailsModalComponent } from './notifications/notification-details-modal/notification-details-modal.component';
import { EditTaskModalComponent } from './to-do-list/edit-task-modal/edit-task-modal.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { LogoutComponent } from './logout/logout.component';
import { AuthGuard } from './auth.guard';
import { EditTaskAaEventModalComponent } from './to-do-list/edit-task-as-event-modal/edit-task-as-event-modal.component';
import { FindDatesModalComponent } from './to-do-list/find-dates-modal/find-dates-modal.component';
import { FindToDoModalComponent } from './home/find-to-do-modal/find-to-do-modal.component';
import { FacebookModule } from 'ngx-facebook';
import { FriendsComponent } from './friends/friends-list.component';
import { SharedCalendarComponent } from './shared-calendars/shared-calendar.component';
import { CannotAccessComponent } from './cannot-access/cannot-access.component';
import { EventDetailsModalComponent } from './shared-calendars/event-details-modal/event-details-modal.component';
import { DefinedPlacesComponent } from './defined-places/defined-places.component';
import { AddNewPlaceModalComponent } from './defined-places/add-new-place-modal/add-new-place-modal.component';
import { UserSettingsModalComponent } from './user-settings-modal/user-settings-modal.component';

export function tokenGetter() {
  return localStorage.getItem('jwt');
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    CalendarComponent,
    FetchDataComponent,
    EditEventModalComponent,
    EventDetailsModalComponent,
    AddEventModalComponent,
    ToDoListComponent,
    AddNewCategoryModalComponent,
    AddNewTaskModalComponent,
    NotificationsComponent,
    NotificationDetailsModalComponent,
    EditTaskModalComponent,
    EditTaskAaEventModalComponent,
    AccessDeniedComponent,
    LogoutComponent,
    FindDatesModalComponent,
    FindToDoModalComponent,
    FriendsComponent,
    SharedCalendarComponent,
    CannotAccessComponent,
    DefinedPlacesComponent,
    AddNewPlaceModalComponent,
    UserSettingsModalComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    DialogsModule,
    DropDownsModule,
    GridModule,
    FacebookModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'XXXXX'
    }),
    //AgmDirectionModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full', canActivate: [AuthGuard] },
      { path: 'counter', component: CounterComponent, canActivate: [AuthGuard] },
      { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] },
      { path: 'sharedCalendars', component: SharedCalendarComponent, canActivate: [AuthGuard] },
      { path: 'fetch-data', component: FetchDataComponent, canActivate: [AuthGuard] },
      { path: 'friends', component: FriendsComponent, canActivate: [AuthGuard] },
      { path: 'to-do-list', component: ToDoListComponent, canActivate: [AuthGuard] },
      { path: 'places', component: DefinedPlacesComponent, canActivate: [AuthGuard] },
      { path: 'access-denied', component: AccessDeniedComponent },
      { path: 'cannot-access', component: CannotAccessComponent },
      { path: 'logout', component: LogoutComponent }
    ]),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost:44332"],
        disallowedRoutes: []
      }
    })
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }

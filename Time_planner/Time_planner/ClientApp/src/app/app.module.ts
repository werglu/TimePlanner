import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
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

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    CalendarComponent,
    FetchDataComponent,
    EditEventModalComponent,
    AddEventModalComponent,
    ToDoListComponent,
    AddNewCategoryModalComponent,
    AddNewTaskModalComponent,
    NotificationsComponent,
    NotificationDetailsModalComponent,
    EditTaskModalComponent
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
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyABcru_NMTTmJLKCoddjaFgqeb9K3X4P48'
    }),
    //AgmDirectionModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'to-do-list', component: ToDoListComponent }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

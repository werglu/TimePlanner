import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from '../notifications/notifications.service';
import { Subscription, interval, Subject } from 'rxjs';
import { UserService } from '../user/user.service';
import { FacebookService, LoginStatus, InitParams } from 'ngx-facebook';
import { Friend } from '../shared/friend';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit, OnDestroy {
  isExpanded = false;
  showNotificationsList = false;
  noNotifications = true;
  subscription: Subscription;
  userId: string;
  me: Friend;
  refresh: Subject<any> = new Subject();
  showPhoto = false;
  showSettingsModal = false;
  theme = 0;
  logged = false;
  @Output() onThemeChange = new EventEmitter<number>();

  constructor(private router: Router,
    private fb: FacebookService,
    private notificationsService: NotificationsService,
    public userService: UserService) {
  }

  ngOnInit(): void {
    const initParams: InitParams = {
      appId: '343708573552335',
      cookie: true,
      xfbml: true,
      version: 'v9.0',
    };

    this.fb.init(initParams);
  
    this.fb.getLoginStatus().then(response => {
        let loginBtn = document.getElementById("loginBtn");
        let logoutBtn = document.getElementById("logoutBtn");
        let notificationsBtn = document.getElementById("notificationBtn");
        let settingsBtn = document.getElementById("settingsBtn");

        if (response.authResponse != null) {
          this.userId = response.authResponse.userID;
          this.userService.getUser().subscribe(user => {
            this.theme = user.theme;
            this.onThemeChange.emit(this.theme);
          });
        }
        const source = interval(5000);
        this.subscription = source.subscribe(val => this.getNotifications());

        if (response.status === 'connected') {
          loginBtn.style.display = "none";
          logoutBtn.style.display = "block";
          notificationsBtn.style.display = "block";
          settingsBtn.style.display = "block";
          this.logged = true;
          this.showPhoto = true;
        } else {
          loginBtn.style.display = "block";
          logoutBtn.style.display = "none";
          notificationsBtn.style.display = "none";
          settingsBtn.style.display = "none";
          this.logged = false;
          this.showPhoto = false;
      }

      this.fb.api(
        "/me",
        "get",
        { "fields": "id,name,picture.type(normal)" }).then(
          response => {
            if (response && !response.error) {
              this.me = {
                FacebookId: response.id,
                name: response.name,
                photoUrl: response.picture.data.url
              };             
            }
          });
    });
  }

  fbLogout() {
    this.fb.logout().then(response => {
      localStorage.removeItem('jwt');
      let loginBtn = document.getElementById("loginBtn");
      loginBtn.style.display = "block";
      let logoutBtn = document.getElementById("logoutBtn");
      logoutBtn.style.display = "none";
      let notificationsBtn = document.getElementById("notificationBtn");
      notificationsBtn.style.display = "none";
      let settingsBtn = document.getElementById("settingsBtn");
      settingsBtn.style.display = "none";
      this.logged = false;
      this.showPhoto = false;
      this.router.navigate(['/logout']);
      this.userId = '';
    });
  }

  fbLogin() {
    this.fb.login({
      scope: 'public_profile, email, user_friends, user_photos, user_events',
      return_scopes: true
    }).then((response: LoginStatus) => {
      if (response.authResponse) {
        let loginBtn = document.getElementById("loginBtn");
        loginBtn.style.display = "none";

        let logoutBtn = document.getElementById("logoutBtn");
        logoutBtn.style.display = "block";
        let notificationsBtn = document.getElementById("notificationBtn");
        notificationsBtn.style.display = "block";
        let settingsBtn = document.getElementById("settingsBtn");
        settingsBtn.style.display = "block";
        this.logged = true;
        this.showPhoto = true;
        if (response.authResponse != null) {
          this.userId = response.authResponse.userID;
          this.userService.getUser().subscribe(user => {
            this.theme = user.theme;
            this.onThemeChange.emit(this.theme);

          });
        }
        this.fb.api(
          "/me",
          "get",
          { "fields": "id,name,picture.type(normal)" }).then(
            response => {
              if (response && !response.error) {
                this.me = {
                  FacebookId: response.id,
                  name: response.name,
                  photoUrl: response.picture.data.url
                };
                this.userService.getUser().subscribe(user => {
                  this.theme = user.theme;
                  this.onThemeChange.emit(this.theme);
                });
                this.router.navigate(['/']);
              }
            });
        this.userService.putUser(response.authResponse.accessToken).subscribe((response) => {
          const token = (<any>response).token;
          localStorage.setItem('jwt', token);
          this.router.navigate(['/']);
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getNotifications() {
    if (this.logged) {
      this.notificationsService.getNotifications().subscribe(n => {
        if (n.length == 0) {
          this.noNotifications = true;
        }
        else {
          this.noNotifications = false;
        }
      });
    }
  }

  collapse() {
    this.isExpanded = false;
  }

  notificationsChanged(noNotifications: boolean) {
    this.noNotifications = noNotifications;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  showNotifications() {
    this.showNotificationsList = !this.showNotificationsList;
  }

  showSettings() {
    this.showSettingsModal = true;
  }

  closeSettings() {
    this.showSettingsModal = false;
  }

  updateTheme(event: number) {
    //this.onThemeChange.emit(event);
    //this.theme = event; // update current theme
    //this.refresh.next();
  }

  themeChanged(event: number) {
    this.closeSettings();
    this.onThemeChange.emit(event);
    this.userService.getUser().subscribe((user) => {
      user.theme = event;
      // update theme for user
      this.userService.editUser(user).subscribe(() => {
        this.theme = event; // update current theme
        this.refresh.next();
      });
    });
  }
}

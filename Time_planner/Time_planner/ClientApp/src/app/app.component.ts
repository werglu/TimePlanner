import { Component, OnInit } from '@angular/core';
import { UserService } from './user/user.service';
import { FacebookService, InitParams } from 'ngx-facebook';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'app';
  theme = 0;
  userId = '';

  constructor(private userService: UserService,
    private fb: FacebookService) {
    let authResp = this.fb.getAuthResponse();
    if (authResp != null) {
      this.userId = authResp.userID;
      if (this.userId != '') {
        this.userService.getUser(this.userId).subscribe((user) => {
          this.theme = user.theme;
        });
      }
    }
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

      if (response.authResponse != null) {
        this.userId = response.authResponse.userID;
        if (this.userId != '') {
          this.userService.getUser(this.userId).subscribe((user) => {
            this.theme = user.theme;
          });
        }
      }
    });
  }

  public themeChanged(event: number) {
    this.theme = event;
  }

}

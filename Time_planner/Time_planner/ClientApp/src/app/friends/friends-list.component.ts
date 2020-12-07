import { Component, OnInit } from '@angular/core';
import { Friend } from '../shared/friend';
import { EventsService } from '../calendar/events.service';
import { UserService } from '../user/user.service';

@Component({
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})

export class FriendsComponent implements OnInit {

  userId: string;
  allFriends: Friend[] = [];
  friends: Friend[] = [];

  ngOnInit(): void {
    this.userService.getUserFriends().subscribe((friendArray) => {
      this.allFriends = friendArray;
      this.friends = friendArray;
    });
  }

  constructor(public eventsService: EventsService,
    public userService: UserService) {
  }

  search() {
    let value = (<HTMLInputElement>document.getElementById("searchInput")).value.toLowerCase();

    if (value == "") {
      this.friends = this.allFriends.slice();
      return;
    }

    this.friends = [];

    this.allFriends.forEach((x) => {
      if (x.name.toLowerCase().indexOf(value) !== -1) {
        this.friends.push(x);
      }
    });
  }
}

import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit } from '@angular/core';
import { UserService } from '../user/user.service';

@Component({
  selector: 'user-settings-modal',
  templateUrl: './user-settings-modal.component.html',
  styleUrls: ['./user-settings-modal.component.css']
})

export class UserSettingsModalComponent implements OnInit, AfterViewInit {
  @Input() userId: string;
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<number>();
  @Output() updateTheme = new EventEmitter<number>();
  currentTheme: number;

  constructor(private userService: UserService) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.userService.getUser(this.userId).subscribe(user => {
      this.currentTheme = user.theme;
      if (this.currentTheme == 0) {
        (<HTMLInputElement>document.getElementById('light')).checked = true;
        (<HTMLInputElement>document.getElementById('mono')).checked = false;
        (<HTMLInputElement>document.getElementById('red')).checked = false;

        this.updateTheme.emit(0);
      }
      if (this.currentTheme == 1) {
        (<HTMLInputElement>document.getElementById('light')).checked = false;
        (<HTMLInputElement>document.getElementById('mono')).checked = true;
        (<HTMLInputElement>document.getElementById('red')).checked = false;

        this.updateTheme.emit(1);
      }
      if (this.currentTheme == 2) {
        (<HTMLInputElement>document.getElementById('light')).checked = false;
        (<HTMLInputElement>document.getElementById('mono')).checked = false;
        (<HTMLInputElement>document.getElementById('red')).checked = true;

        this.updateTheme.emit(2);
      }
    });
  }

  save() {
    var light = (<HTMLInputElement>document.getElementById('light')).checked;
    var mono = (<HTMLInputElement>document.getElementById('mono')).checked;
    var red = (<HTMLInputElement>document.getElementById('red')).checked;

    if (light) {
      this.onSave.emit(0);
    }
    else if (mono) {
      this.onSave.emit(1);
    }
    else if (red) {
      this.onSave.emit(2);
    }
  }

  cancel() {
    this.onCancel.emit();
  }
}

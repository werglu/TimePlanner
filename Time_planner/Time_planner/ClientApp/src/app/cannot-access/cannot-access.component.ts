import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './cannot-access.component.html',
  styleUrls: ['./cannot-access.component.css']
})

export class CannotAccessComponent {

  constructor(private router: Router) {
    setTimeout(() => {
      this.router.navigate(['']);
    }, 3000);
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splah-animado',
  templateUrl: './splah-animado.page.html',
  styleUrls: ['./splah-animado.page.scss'],
})
export class SplahAnimadoPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate([`/login`]);
    }, 2000);
  }
}

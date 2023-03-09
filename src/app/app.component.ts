import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MouseUtilityService } from './services/mouse-utility.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  sub = new Subscription();
  constructor(mouseService: MouseUtilityService) {
    this.sub.add(mouseService.initialize());
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  links = [
    {
      text: 'Sidebar Showcase',
      path: '/sidebar',
    },
    {
      text: 'Liquid Showcase',
      path: '/liquid',
    },
  ];
}

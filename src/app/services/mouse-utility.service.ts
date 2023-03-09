import { Injectable } from '@angular/core';
import { fromEvent, merge, tap, interval } from 'rxjs';

export interface MousePointerInfo {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  speedX: number;
  speedY: number;
  speed: number;
}

@Injectable({
  providedIn: 'root',
})
export class MouseUtilityService {
  x = 0;
  y = 0;
  lastX = 0;
  lastY = 0;
  directionX = 0;
  directionY = 0;
  speedX = 0;
  speedY = 0;
  speed = 0;

  constructor() {}

  initialize() {
    return merge(
      fromEvent(document, 'mousemove').pipe(
        tap((e) => {
          this.getMouseDirection(e);
        })
      ),
      interval(50).pipe(
        tap(() => {
          this.getMouseSpeed();
        })
      )
    ).subscribe();
  }

  getInfo() {
    return {
      x: this.x,
      y: this.y,
      directionX: this.directionX,
      directionY: this.directionY,
      speedX: this.speedX,
      speedY: this.speedY,
      speed: this.speed
    } as MousePointerInfo;
  }

  private getMouseDirection(e) {
    if (this.x < e.pageX) this.directionX = 1;
    else if (this.x > e.pageX) this.directionX = -1;
    else this.directionX = 0;

    if (this.y < e.pageY) this.directionY = 1;
    else if (this.y > e.pageY) this.directionY = -1;
    else this.directionY = 0;

    this.x = e.pageX ?? 0;
    this.y = e.pageY ?? 0;
  }

  private getMouseSpeed() {
    this.speedX = this.x - this.lastX;
    this.speedY = this.y - this.lastY;

    this.speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);

    this.lastX = this.x;
    this.lastY = this.y;
  }
}

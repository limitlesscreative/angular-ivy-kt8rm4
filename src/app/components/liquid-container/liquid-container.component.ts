import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import gsap from 'gsap';
import { MouseUtilityService } from '../../services/mouse-utility.service';

const SQUARE_POINTS = 4;

const DEBUG_SHOW_POINTS = true;
const POINT_RESISTANCE = 40;
const POINT_RESISTANCE_NOISE = 0;
const POINT_DAMPING = 0.08;
const MOUSE_DISTANCE = 40;
const FORCE_FACTOR = 2.05;
const FORCE_MAX_LIMIT = 4;

class Point {
  x: number;
  ix: number;
  vx: number;
  cx: number;
  y: number;
  iy: number;
  cy: number;
  vy: number;
  nx: number;
  ny: number;

  constructor(x: number, y: number, nx: number, ny: number) {
    this.x = x;
    this.ix = x;
    this.vx = 0;
    this.cx = 0;
    this.y = y;
    this.iy = y;
    this.cy = 0;
    this.vy = 0;
    this.nx = nx;
    this.ny = ny;
  }
}

@Component({
  selector: 'liquid-container',
  templateUrl: './liquid-container.component.html',
  styleUrls: ['./liquid-container.component.scss'],
})
export class LiquidContainerComponent implements OnInit, AfterViewInit {
  @ViewChild('Canvas') canvasEl: ElementRef<HTMLCanvasElement>;

  totalPoints = 6 * SQUARE_POINTS;
  points = [];
  pointsGapX: number;
  pointsGapY: number;
  canvas?: HTMLCanvasElement;
  canvasBounds?: DOMRect;
  context?: CanvasRenderingContext2D;

  constructor(private mouseService: MouseUtilityService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.init();
    this.render();
  }

  private init() {
    this.canvas = this.canvasEl.nativeElement;
    this.canvasBounds = this.canvas.getBoundingClientRect();
    this.context = this.canvas.getContext('2d');
    this.points = [];
    const pointsEachSide = (this.totalPoints - 4) / 4;
    var gapX = this.canvas.width / (pointsEachSide + 1);
    var gapY = this.canvas.height / (pointsEachSide + 1);

    let pointX = 0;
    let pointY = 0;
    let normalX = 0;
    let normalY = 1;
    for (let i = 0; i < this.totalPoints; i++) {
      this.points.push(new Point(pointX, pointY, normalX, normalY));
      if (pointY === 0 && pointX < this.canvas.width) {
        pointX += gapX;
        if (pointX > this.canvas.width) {
          pointX = this.canvas.width;
        }
        continue;
      }
      if (pointX === this.canvas.width && pointY < this.canvas.height) {
        normalX = 1;
        normalY = 0;
        pointY += gapY;
        if (pointY > this.canvas.height) {
          pointY = this.canvas.height;
        }
        continue;
      }
      if (pointY === this.canvas.height && pointX > 0) {
        normalX = 0;
        normalY = -1;
        pointX -= gapX;
        if (pointX < 0) {
          pointX = 0;
        }
        continue;
      }
      if (pointX === 0 && pointY > 0) {
        normalX = -1;
        normalY = 0;
        pointY -= gapY;
      }
    }

    this.pointsGapX = gapX;
    this.pointsGapY = gapY;
  }
  log = true;
  private render() {
    requestAnimationFrame(() => this.render());

    // Clear scene
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Begin rendering liquid container
    this.context.fillStyle = '#000';
    // this.context.strokeStyle = '#000';
    // this.context.lineWidth = 1;
    this.context.beginPath();

    // Update points data & Draw
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      const mouse = this.mouseService.getInfo();

      // point.vx += (point.ix - point.x) / POINT_RESISTANCE;
      // point.vy += (point.iy - point.y) / POINT_RESISTANCE;
      let dix =
        (point.ix - point.x) / POINT_RESISTANCE +
        (Math.random() - 0.5) * POINT_RESISTANCE_NOISE;
      let diy =
        (point.iy - point.y) / POINT_RESISTANCE +
        (Math.random() - 0.5) * POINT_RESISTANCE_NOISE;
      let di = calculateDistance(dix, diy);
      let f = di * FORCE_FACTOR;
      point.vx += f * (dix / di || 0);
      point.vy += f * (diy / di || 0);

      let x = this.canvasBounds.x + point.x;
      let y = this.canvasBounds.y + point.y;
      let dx = x - mouse.x;
      let dy = y - mouse.y;
      let d = calculateDistance(dx, dy);

      const directionX = this.canvasBounds.x > mouse.x ? -1 : 1;
      const directionY = this.canvasBounds.y > mouse.y ? -1 : 1;

      if (d < MOUSE_DISTANCE) {
        // point.vx += mouse.speedX / 8;
        // point.vy += mouse.speedY / 8;

        let mf = Math.max(
          -FORCE_MAX_LIMIT,
          Math.min(FORCE_MAX_LIMIT, (100 * mouse.speed) / d)
        );
        // let mf = 1;
        point.vx = mf * (dx / d || 0);
        point.vy = mf * (dy / d || 0);

        if (point.nx === 0) {
          point.vx *= 0.15;
        }
        if (point.ny === 0) {
          point.vy *= 0.15;
        }
      }

      point.vx *= 1 - POINT_DAMPING;
      point.vy *= 1 - POINT_DAMPING;
      point.x += point.vx;
      point.y += point.vy;

      // if (d < MOUSE_DISTANCE) {
      //   point.x =
      //     (dx / (1 + dy * 0.5)) * (this.canvasBounds.x > mouse.x ? -1 : 1);
      //   // point.vy = mouse.speedY / 8;
      // }

      let previousPoint = this.points[i === 0 ? this.points.length - 1 : i - 1];
      let nextPoint = this.points[i === this.points.length - 1 ? 0 : i + 1];

      // 0.0001 is used to fix the one pixel error issue on Chrome
      let cx = (point.x + nextPoint.x) / 2 - 0.0001;
      let cy = (point.y + nextPoint.y) / 2 - 0.0001;

      let absolutecx = this.canvasBounds.x + cx;
      let absolutecy = this.canvasBounds.y + cy;

      let cdx = Math.abs(absolutecx - mouse.x);
      let cdy = Math.abs(absolutecy - mouse.y);
      let cd = Math.sqrt(Math.pow(cdx, 2) + Math.pow(cdy, 2));
      if (cd < MOUSE_DISTANCE) {
        // cx +=
        //   (cdx / (1 + cdy * 0.08)) * (this.canvasBounds.x > mouse.x ? -1 : 1);
        // cy = mouse.y - this.canvasBounds.y;
        if (cd < MOUSE_DISTANCE) {
        } else {
          // console.log(cx);
          // cx = cx + Math.abs(Math.sin(cdx)) * (mouse.x - this.canvasBounds.x);
          // console.log(
          //   cdx,
          //   Math.abs(Math.sin(cdx)),
          //   mouse.x - this.canvasBounds.x,
          //   Math.abs(Math.sin(cdx)) * (mouse.x - this.canvasBounds.x),
          //   cx
          // );
          // cy = cy + Math.abs(Math.sin(cdy)) * (mouse.y - this.canvasBounds.y);
        }

        // cx += -1 * mouse.directionX * point.vx;
        // cy += -1 * mouse.directionY * point.vy;
      }

      let deltacx = point.cx - cx;
      let deltacy = point.cy - cy;

      point.cx = cx;
      point.cy = cy;

      this.points[i] = point;

      // Register the new point to liquid container curve
      if (i == 0) {
        this.context.moveTo(point.x, point.y);
      } else {
        this.context.bezierCurveTo(
          point.x,
          point.y,
          point.cx,
          point.cy,
          point.cx,
          point.cy
        );
      }
    }
    // this.context.quadraticCurveTo(
    //   this.points[0].cx,
    //   this.points[0].cy,
    //   this.points[0].x,
    //   this.points[0].y
    // );
    this.log = false;
    this.context.closePath();
    this.context.fill();

    if (DEBUG_SHOW_POINTS) {
      this.canvas.getContext('2d').fillStyle = '#ff0000';
      this.context.beginPath();
      for (let point of this.points) {
        this.context.rect(point.x - 4, point.y - 4, 8, 8);
      }
      this.context.fill();
      this.context.fillStyle = '#fff';
      this.context.beginPath();
      for (let point of this.points) {
        this.context.rect(point.cx - 1, point.cy - 1, 2, 2);
      }
      this.context.fill();
      this.context.fillStyle = '#0000ff';
      this.context.beginPath();
      for (let point of this.points) {
        this.context.rect(point.ix - 1, point.iy - 1, 2, 2);
      }
      this.context.fill();
      this.context.fillStyle = '#00ff00';
      this.context.beginPath();
      for (let point of this.points) {
        this.context.rect(point.x + point.vx - 1, point.y + point.vy - 1, 2, 2);
      }
      this.context.fill();
      this.context.fillStyle = '#00ff22';
      this.context.beginPath();
      for (let point of this.points) {
        this.context.rect(
          point.x + point.nx * 10,
          point.y + point.ny * -10,
          2,
          2
        );
      }
      this.context.fill();
    }
  }
}

function calculateDistance(x, y) {
  return Math.sqrt(x * x + y * y);
}

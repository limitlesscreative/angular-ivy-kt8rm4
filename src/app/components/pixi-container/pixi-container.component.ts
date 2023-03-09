import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

//@ts-ignore
const PIXI: any = require('pixi.js');

@Component({
  selector: 'pixi-container',
  templateUrl: './pixi-container.component.html',
  styleUrls: ['./pixi-container.component.scss'],
})
export class PixiContainerComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  app: any;

  constructor(private host: ElementRef<HTMLElement>) {
    this.app = new PIXI.Application({
      // width: this.host.nativeElement.clientWidth,
      // height: this.host.nativeElement.clientHeight,
      resizeTo: this.host.nativeElement,
    });
    this.host.nativeElement.appendChild(this.app.view);
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {
    PIXI.utils.destroyTextureCache();
  }
}
